var WalletModel = require('models/wallet');
var ControllerUtils = require('./util');
var Stellar = require('js-stellar-lib');
var Config = require('../config');

var Transaction = {
    send: function send(req, res, next) {
        var fromMsisdn = req.params['msisdn'];
        var toMsisdn = req.params['tomsisdn'];
        var amount = req.params['amount'];

        var auth = ControllerUtils.parseAuthorizationHeader(req, msisdn);
        if (auth.error_message) {
            // AAHHH
            throw new Error(auth.error_message);
        }

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
            });
    }
};
