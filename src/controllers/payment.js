var PaymentModel = require('../models/payment');
var ControllerUtils = require('./util');

var Payment = {
    send: function send(req, res, next) {
        var fromMsisdn = req.params['frommsisdn'];
        var toMsisdn = req.params['tomsisdn'];
        var amount = req.params['amount'];

        if(!fromMsisdn || !toMsisdn || !amount) {
            res.send({
                submitted: false,
                error_message:  'your msisdn or amounts are invalid'
            });
        }

        var auth = ControllerUtils.parseAuthorizationHeader(req, fromMsisdn);
        if (auth.error_message) {
            // AAHHH
            throw new Error(auth.error_message);
            res.send({
                submitted: false,
                error_message: auth.error_message
            });
        }

        PaymentModel.create(fromMsisdn, auth.pin, toMsisdn, amount)
            .then(function(result) {
                res.send({submitted: true});
                next();
            }).catch(
                function(error) {
                    var message = 'Unknown error occurred';
                    if (error instanceof PaymentModel.PaymentError) {
                        message = error.message;
                    }
                    res.send({submitted: false, error_message: message});
                    next();
                }
            );
    }
};
module.exports = Payment;
