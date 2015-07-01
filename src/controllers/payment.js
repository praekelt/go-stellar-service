var PaymentModel = require('../models/payment');
var ControllerUtils = require('./util');

var Payment = {
    send: function send(req, res, next) {
        var from_msisdn = req.params['frommsisdn'];
        var to_msisdn = req.params['tomsisdn'];
        var amount = req.params['amount'];

        if(!from_msisdn || !to_msisdn || !amount) {
            res.status(400);
            res.send({
                submitted: false,
                error_message:  'your msisdn or amounts are invalid'
            });
        }

        var auth = ControllerUtils.parseAuthorizationHeader(req, from_msisdn);
        if (auth.error_message) {
            // AAHHH
            res.status(400);
            res.send({
                submitted: false,
                error_message: auth.error_message
            });
        }

        PaymentModel.create(from_msisdn, auth.pin, to_msisdn, amount)
            .then(function(result) {
                res.send({submitted: true});
                // only deal with the next request once we're done with this
                next();
            }).catch(function(error) {
                var message;
                if (error instanceof PaymentModel.PaymentError) {
                    res.send(400);
                    message = error.message;
                } else {
                    message = 'Unknown error occurred';
                    res.send(500);
                }
                res.send({submitted: false, error_message: message});
                next();
            });
    }
};
module.exports = Payment;
