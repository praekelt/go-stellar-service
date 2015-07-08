var Restify = require('restify');
var Config = require('./config');
var PaymentController = require('./controllers/payment');
var ControllersUtil = require('./controllers/util');

var server = Restify.createServer();

server.use(Restify.acceptParser(server.acceptable));
server.use(Restify.jsonp());
server.use(Restify.bodyParser({ mapParams: true}));


server.post('/v1/payment', PaymentController.send);
server.post('/v1/wallet', ControllersUtil.wallet_proxy('/v1/wallet', 'POST'));

server.listen(Config.PORT, function() {
	console.log('Listening for requests');
});
server.on('uncaughtException', function (req, res, route, err) {
    console.error('uncaughtException', err.stack);
});
