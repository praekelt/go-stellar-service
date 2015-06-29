var TransactionModel = require('../models/transaction');
var ControllerUtils = require('./util');

var Transaction = {
    send: function send(req, res, next) {
        var fromMsisdn = req.params['frommsisdn'];
        var toMsisdn = req.params['tomsisdn'];
        var amount = req.params['amount'];

        var auth = ControllerUtils.parseAuthorizationHeader(req, fromMsisdn);
        if (auth.error_message) {
            // AAHHH
            throw new Error(auth.error_message);
            res.send(JSON.stringify({
                submitted: false,
                error_message: auth.error_message
            }));
        }

        TransactionModel.create(fromMsisdn, auth.pin, toMsisdn, amount)
            .then(function(result) {
                console.log('trnsaction stuff');
                console.log(result);
                res.send(JSON.stringify({submitted: true}));
                next();
            }).catch(function(error) {
                console.log('failure :(')
                console.log(error);
                res.send(JSON.stringify({submitted: false}));
                next();
            });
    }
};
module.exports = Transaction;
