var Validator = require('validator');
var wallet = {
	create: function(req, res, next) {
		// parse arguments
		// call create wallet on wallet server
		var msisdn = req.params['msisdn'];
		var pin = req.params['pin'];
		var verify_pin = req.params['verify-pin'];
		
		var error_message = '';
		if (pin !== undefined &&
		    verify_pin !== undefined &&
		    msisdn !== undefined) {
			error_message = 'missing argument';
		}
		// TODO: this shouldn't just be ZA
		if (!validate.isMobilePhone(msisdn, 'en-ZA')) {
			error_message = 'not a validate mobile number';
		}
		if (!validate.isNumeric(pin)) {
			error_message = 'pin must be numeric';
		}
		if (pin != verify_pin) {
			error_message = 'pins do not match';
		}

		if (error_message != '') {
			return next(new restify.BadRequestError(error_message));
		}

		next();
	},
	fetch: function(req, res, next) {
	}
};

module.exports = wallet;
