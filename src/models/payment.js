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
        from_msisdn: {
            type: Sequelize.STRING
        },
        to_msisdn: {
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
        payment_hash: {
            type: Sequelize.STRING
        },
        payment_result: {
            type: Sequelize.STRING
        },
    }),

    create: function(from_msisdn, from_pin, to_msisdn, amount) {
        var stellar = new Stellar.Server(Config.HORIZON);

        // fetch from_msisdn's wallet data and put it here
        var wallet_data;
        // to_msisdn't corresponding address 
        var toAddress, stellarAccount;

        return WalletModel.fetch(from_msisdn, from_pin)
            .then(function(received_wallet_data) {
                var error =  received_wallet_data.message || received_wallet_data.error_message;
                if (error) {
                    return Promise.reject(new PaymentError(error));
                }
                wallet_data = received_wallet_data;
                return WalletModel.fetchAddress(to_msisdn);
            })
            .then(function(received_to_address) {
                if (!received_to_address)
                    return Promise.reject(new PaymentError('Error fetching wallets'));
                var to_address_data = received_to_address;
                if (to_address_data.error_message) {
                    return Promise.reject(new PaymentError(
                        'Error fetching to_msisdn wallet '+to_address_data.error_message));
                }
                toAddress = to_address_data.address;

                return stellar.loadAccount(wallet_data.address);
            })
            .then(function(received_stellar_account) {
                stellarAccount = received_stellar_account;

                var stellar_keypair = new Stellar.Keypair({
                    secretKey: new Buffer(wallet_data.privatekey, 'base64'),
                    publicKey: new Buffer(wallet_data.publickey, 'base64'),
                    secretSeed: 'do not actually have the secret seed'
                });
                var payment = new Stellar.TransactionBuilder(stellarAccount)
                    .addOperation(Stellar.Operation.payment({
                        destination: toAddress,
                        currency: Stellar.Currency.native(),
                        amount: amount
                    }))
                    .build();
                payment.addSignature(payment.sign(stellar_keypair));
                return stellar.submitTransaction(payment);
            })
            .then(function(payment) {
                // create pending payment row in table
                // TODO we should watch this payment for updates and notify interested parties
                if(payment.error) {
                    return Promise.reject(new PaymentError(payment.error));
                }
                return Payment.Payment.create({
                    payment_hash: payment.hash,
                    payment_result: payment.result,
                    from_msisdn: from_msisdn,
                    to_msisdn: to_msisdn,
                    amount: amount,
                    currency: 'NATIVE',
                    fee: payment.feeCharged,
                    state: 'pending'
                });
            });
    }
};
module.exports = Payment;
