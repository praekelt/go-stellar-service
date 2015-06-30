var Promise = require('promise');
var Http = require('http');
var Config = require('../config');

function Wallet(
    msisdn,
    private_key,
    public_key) {
}

var wallet = {
    create: function(msisdn, pin) {
        return Promise.resolve(function(resolve, reject) {
            var wallet_request = Http.request({
                hostname: Config.WALLET_SERVER,
                path: '/v1/create',
            }, 
            function(res) {
                res.on('data', function(data) {
                });
            });
        });
    },
    fetch: function(msisdn, pin) {
        var auth = 'Basic '+new Buffer(msisdn+':'+pin).toString('base64');
        return new Promise(function(resolve, reject) {
            var wallet_request = Http.request({
                hostname: Config.WALLET_SERVER,
                port: Config.WALLET_PORT,
                path: '/v1/wallet/'+msisdn,
                headers: {
                    'Authorization': auth
                }
            }, 
            function(res) {
                res.on('data', function(data) {
                    var wallet_data = JSON.parse(data.toString());
                    resolve(wallet_data);
                });
                res.on('error', function(data) {
                    console.error(data);
                    reject(data);
                });
            });
            wallet_request.end();
        });
    },

    fetchAddress: function(msisdn) {
        return new Promise(function(resolve, reject) {
            var wallet_request = Http.request({
                hostname: Config.WALLET_SERVER,
                port: Config.WALLET_PORT,
                path: '/v1/wallet/'+msisdn+'/address',
            }, 
            function(res) {
                res.on('data', function(data) {
                    var address_data = JSON.parse(data.toString());
                    if(address_data.error_message) {
                        reject(address_data);
                    } else {
                        resolve(address_data);
                    }
                });
                res.on('error', function(data) {
                    reject(data);
                });
            });
            wallet_request.end();
        });
    }
};
module.exports = wallet;
