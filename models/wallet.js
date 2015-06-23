var Promise = require('promise');
var Http = require('http');
var Config = require('./config');

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
				}
			});
		});
	}
};
