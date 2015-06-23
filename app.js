var Restify = require('restify');
var Config = require('./config');
var WalletController = require('./controllers/wallet');

var server = Restify.createServer();

server.use(restify.jsonp());
server.use(restify.bodyParser({ mapParams: true});


server.post('/v1/wallet', WalletController.create);
server.get('/v1/wallet', WalletController.fetch);

server.listen(Config.PORT, function() {
	console.log('Listening for requests');
});
