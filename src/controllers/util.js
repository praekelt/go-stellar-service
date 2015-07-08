var Http = require('http');
var Config = require('../config');

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

    wallet_proxy: function(path, method) {
        return function(req, res, next) {
            if (!path.test(req.path())) {
                res.send(500, {errorMessage: "An unexpected error occurred"});
                return;
            }
            var http_request = Http.request({
                hostname: Config.WALLET_SERVER,
                port: Config.WALLET_PORT,
                method: method,
                path: req.path(),
                headers: req.headers
            },
            function(http_res) {
                http_res.on('data', function(data) {
                    res.send(http_res.statusCode, JSON.parse(data.toString()));
                });
            });
            http_request.on('error', function(error) {
                console.error(error);
                res.send(500, {errorMessage: "An unexpected error occurred"});
            });
            http_request.write(req.body);
            http_request.end();
        }
    }
};
module.exports = Utils;
