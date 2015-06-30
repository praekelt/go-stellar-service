var Stellar = require('js-stellar-lib');
var WalletModel = require('./wallet');
var Config = require('../config');
var Sequelize = require('sequelize');
var sequelize = require('./db').sequelize;

function PaymentError(message) {
    this.message = message;
}
PaymentError.prototype = Object.create(Error.prototype);

var Payment = {
    PaymentError: PaymentError,

    Payment: sequelize.define('payment', {
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
        paymenthash: {
            type: Sequelize.STRING
        },
        paymentresult: {
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
                    return Promise.reject(new PaymentError(error));
                }
                walletData = receivedWalletData;
                return WalletModel.fetchAddress(tomsisdn);
            })
            .then(function(receivedToAddress) {
                if (!receivedToAddress)
                    return Promise.reject(new PaymentError('Error fetching wallets'));
                var toAddressData = receivedToAddress;
                if (toAddressData.error_message) {
                    return Promise.reject(new PaymentError(
                        'Error fetching toMsisdn wallet '+toAddressData.error_message));
                }
                toAddress = toAddressData.address;

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
                var payment = new Stellar.PaymentBuilder(stellarAccount)
                    .addOperation(Stellar.Operation.payment({
                        destination: toAddress,
                        currency: Stellar.Currency.native(),
                        amount: amount
                    }))
                    .build();
                payment.addSignature(payment.sign(stellarKeypair));
                return stellar.submitPayment(payment);
            })
            .then(function(payment) {
                // create pending payment row in table
                // TODO we should watch this payment for updates and notify interested parties
                if(payment.error) {
                    return Promise.reject(new PaymentError(payment.error));
                }
                return Payment.Payment.create({
                    paymenthash: payment.hash,
                    paymentresult: payment.result,
                    frommsisdn: frommsisdn,
                    tomsisdn: tomsisdn,
                    amount: amount,
                    currency: 'NATIVE',
                    fee: payment.feeCharged,
                    state: 'pending'
                });
            });
    }
};
module.exports = Payment;
