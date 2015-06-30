var Stellar = require('js-stellar-lib');
var WalletModel = require('./wallet');
var Config = require('../config');
var Sequelize = require('sequelize');
var sequelize = require('./db').sequelize;

function TransactionError(message) {
    this.message = message;
}
TransactionError.prototype = Object.create(Error.prototype);

var Transaction = {
    TransactionError: TransactionError,

    Transaction: sequelize.define('transaction', {
        frommsisdn: {
            type: Sequelize.STRING
        },
        tomsisdn: {
            type: Sequelize.STRING
        },
        amount: {
            type: Sequelize.STRING
        },
        currency: {
            type: Sequelize.STRING
        },
        fee: {
            type: Sequelize.STRING
        },
        state: {
            type: Sequelize.ENUM('pending', 'success', 'fail')
        },
        transactionhash: {
            type: Sequelize.STRING
        },
        transactionresult: {
            type: Sequelize.STRING
        },
    }),

    create: function(frommsisdn, frompin, tomsisdn, amount) {
        var stellar = new Stellar.Server(Config.HORIZON);

        // fetch frommsisdn's wallet data and put it here
        var walletData;
        // tomsisdn't corresponding address 
        var toAddress, stellarAccount;

        return WalletModel.fetch(frommsisdn, frompin)
            .then(function(receivedWalletData) {
                console.log(receivedWalletData);
                var error =  receivedWalletData.message || receivedWalletData.error_message;
                if (error) {
                    return Promise.reject(new TransactionError(error));
                }
                walletData = receivedWalletData;
                return WalletModel.fetchAddress(tomsisdn);
            })
            .then(function(receivedToAddress) {
                if (!receivedToAddress)
                    return Promise.reject(new TransactionError('Error fetching wallets'));
                var toAddressData = receivedToAddress;
                if (toAddressData.error_message) {
                    return Promise.reject(new TransactionError(
                        'Error fetching toMsisdn wallet '+toAddressData.error_message));
                }
                var toAddress = toAddressData.address;

                return stellar.loadAccount(walletData.address);
            })
            .then(function(receivedStellarAccount) {
                console.log('received stellar account');
                console.log(receivedStellarAccount);
                stellarAccount = receivedStellarAccount;

                var stellarKeypair = new Stellar.Keypair({
                    secretKey: new Buffer(walletData.privatekey, 'base64'),
                    publicKey: new Buffer(walletData.publickey, 'base64'),
                    secretSeed: 'do not actually have the secret seed'
                });
                var transaction = new Stellar.TransactionBuilder(stellarAccount)
                    .addOperation(Stellar.Operation.payment({
                        destination: toAddress,
                        currency: Stellar.Currency.native(),
                        amount: amount
                    }))
                    .build();
                transaction.addSignature(transaction.sign(stellarKeypair));
                return stellar.submitTransaction(transaction);
            })
            .then(function(transaction) {
                // create pending transaction row in table
                // TODO we should watch this transaction for updates and notify interested parties
                if(transaction.error) {
                    return Promise.reject(new TransactionError(transaction.error));
                }
                return Transaction.Transaction.create({
                    transactionhash: transaction.hash,
                    transactionresult: transaction.result,
                    frommsisdn: frommsisdn,
                    tomsisdn: tomsisdn,
                    amount: amount,
                    currency: 'NATIVE',
                    fee: transaction.feeCharged,
                    state: 'pending'
                });
            });
    }
};
module.exports = Transaction;
