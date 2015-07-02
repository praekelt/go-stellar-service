var Stellar = require('js-stellar-lib');
var Config = require('../config');

var stellar = new Stellar.Server(Config.HORIZON);
module.exports = {
    stellar: stellar
}
