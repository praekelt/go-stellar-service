var walletmodel = require('./models/wallet');

walletmodel.fetchAddress('0823781544')
    .done(function(result) {
        console.log(result);
    });
