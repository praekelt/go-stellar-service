var TransactionModel = require('../models/transaction');
var ControllerUtils = require('./util');

var Transaction = {
    send: function send(req, res, next) {
        var fromMsisdn = req.params['frommsisdn'];
        var toMsisdn = req.params['tomsisdn'];
        var amount = req.params['amount'];

        if(!fromMsisdn || !toMsisdn || !amount) {
            res.send(JSON.stringify({
                submitted: false,
                error_message:  'your msisdn or amounts are invalid'
            }));
        }

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
                res.send(JSON.stringify({submitted: true}));
                next();
            }).catch(
                function(error) {
                    var message = 'Unknown error occurred';
                    if (error instanceof TransactionModel.TransactionError) {
                        message = error.message;
                    }
                    res.send(JSON.stringify({submitted: false, error_message: message}));
                    next();
                }
            );
    }
};
module.exports = Transaction;
