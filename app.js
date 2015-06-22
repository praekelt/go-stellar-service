var Restify = require('restify');
var Config = require('./config');

var WalletController = require('./controllers/wallet');

var server = Restify.createServer();

server.post('/v1/wallet', WalletController.create_wallet);
server.get('/v1/wallet', WalletController.fetch_wallet);

server.post('/v1/authenticate', AuthenticationController.authenticate);

server.listen(Config.PORT, function() {
	console.log('Listening for requests');
});
