var Stellar = require('js-stellar-lib');
var WalletModel = require('models/wallet');
var Config = require('../config');
var Sequelize = require('sequelize');
var sequelize = require('models/db').sequelize;

var Transaction = {
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
        }
    }),
    create: function(frommsisdn, tomsisdn, amount) {
        var stellar = new Stellar.Server({
            hostname: Config.STELLAR_HORIZON_SERVER,
            port: Config.STELLAR_HORIZON_PORT,
        });

        var walletData;

        return WalletModel.fetch(auth.msisdn, auth.pin)
            .then(function(receivedWalletData) {
                walletData = receivedWalletData;
                return stellar.loadAccount(walletData.address);
            }).then(function(stellarAccount) {
                var stellarKeypair = new Stellar.Keypair({
                    secretKey: walletData.privateKey,
                    publicKey: walletData.publicKey
                });
                var transaction = new Stellar.TransactionBuilder(stellarAccount)
                    .addOperation(Stellar.Operation.payment({
                        currency: Stellar.Currency.native(),
                        amount: amount
                    })
                    .build();
                transaction.addSignature(transaction.sign(stellarKeypair));
                return stellar.submitTransaction(transaction);
            }).then(function(transaction) {
                // create pending transaction row in table
                // TODO we should watch this transaction for updates and notify interested parties
                return this.Transaction.create({
                    frommsisdn: frommsisdn,
                    tomsisdn: tomsisdn,
                    amount: amount,
                    currency: 'NATIVE',
                    fee: transaction.feeCharged,
                    state: 'pending
                });
            });
    }
};
