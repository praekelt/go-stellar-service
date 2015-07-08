describe("Payments", function() {
    var wallet1 = {
        msisdn: '0769459577',
        address: 'gs6EqxZ9E4ndT42nD5JEQJW1K71NJmuvBPszMYAjHM8cRXZFToE',
        publickey: '3xokOmC0gFhk/OHwV4MERg4mITSCeovyjiQCHuChJV4=',
        privatekey: 'd3rEy+Zxf4tz3jOWx2ruXFbQUdPHxtYY+cWCUHyGYlffGiQ6YLSAWGT84fBXgwRGDiYhNIJ6i/KOJAIe4KElXg==',
    }; 
    var wallet2 = { 
          msisdn: '0823781544',
          address: 'gsFqv47jL9YFggWz2BbjvrdKyjnkjcxUA1hVGSmSmGmMjafpRNp',
    };

    var Stellar = require('js-stellar-lib');
    var stellar_account = new Stellar.Account(wallet1.address, 1);

    it("make payment", function(done) {
        var WalletModel = require('../../models/wallet');
        var PaymentModel = require('../../models/payment');
        var stellar = require('../../models/stellar').stellar;

        spyOn(WalletModel, 'fetch').and.returnValue(
            Promise.resolve(wallet1));
        spyOn(WalletModel, 'fetchAddress').and.returnValue(
            Promise.resolve(wallet2));
        spyOn(stellar, 'loadAccount').and.returnValue(
            Promise.resolve(stellar_account));
        spyOn(stellar, 'submitTransaction').and.returnValue(
            Promise.resolve({
                payment_hash: '',
                result: '',
                feeCharged: ''
        }));
        spyOn(PaymentModel.Payment, 'create').and.returnValue(
            Promise.resolve({dataValues: {a:'a'}}));

        PaymentModel.create('0769459577', '123456', '0823781544', 10)
            .then(done);
    });
});
