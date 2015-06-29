/**
* In this example, we'll create a transaction that funds a new account from the
* root account.
*/
var StellarLib = require('js-stellar-lib');
// create the server connection object
var server = new StellarLib.Server({
    port: 443,
    secure: true,
    //hostname: 'localhost'
    hostname: 'horizon-testnet.stellar.org'
});
console.log('server');

// load the root account's current details from the server
server.loadAccount("gs6wAdighrSXkKTjAtyESkgBtaNRpXYLnp5ZuhfA7fMThTh6WrW")
    .then(function (account) {
        // build the transaction
        var transaction = new StellarLib.TransactionBuilder(account)
            // this operation funds the new account with XLM
            .addOperation(StellarLib.Operation.payment({
                destination: "ghxw4YuuQvQvwXMSVTnGUrWZcxXjUHyEvvpXajWDsXoaLwAcrE",
                currency: StellarLib.Currency.native(),
                amount: "20000000"
            }))
            .build();
        // now we need to sign the transaction with the source (root) account
        var keypair = StellarLib.Keypair.fromSeed("sfjq2UWaAVgRYJqAU6JRVpfn3Z7U1Wwn2t7JFxiVdKkKRxuUgAE");
        var signature = transaction.sign(keypair);
        transaction.addSignature(signature);
        return server.submitTransaction(transaction);
    })
    .then(function (transactionResult) {
        //61b746a6d5dd19b5f2882a0f01fd6e18a1e602fedcd34bfe3586edcb925cb005
        console.log('transaction result');
        console.log(transactionResult);
    })
    .catch(function (err) {
console.log('transaction error');
console.log(err);
        console.error(err.stack);
    });
