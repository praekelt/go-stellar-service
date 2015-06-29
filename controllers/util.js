var Utils = {
    parseAuthorizationHeader: function(req, msisdn) {
        var error_message = '';
        if (req.headers.authorization === undefined) {
            return {
                error_message: 'Please enter your pin to fetch this wallet'
            };
        } 
        var auth_header = req.headers.authorization.split(' ');
        if (auth_header[0] != 'Basic') {
            return {
                error_message: 'Please use basic authentication'
            };
        }
        var auth_header_decoded = new Buffer(auth_header[1], 'base64')
                                    .toString()
                                    .split(':');
        var auth_msisdn = auth_header_decoded[0];
        if(!error_message && msisdn && auth_msisdn != msisdn) {
            error_message = 'Authentication failure';
        }
        return {
            error_message: '',
            msisdn: auth_header_decoded[0],
            pin: auth_header_decoded[1]
        };
    },
};
module.exports = Utils;
