const transactionMarks = require('./constans.js').transactionMarks;

function markTransaction(transaction) {
    if (transaction.mark === transactionMarks.INVALID) {
        console.log(`Transaction ${JSON.stringify(transaction)} is already marked as invalid and it will be not overridden`);
        return;
    }

    transaction.mark = transactionMarks.LEADS_TO_INVALID;
}

function markTransactionsAsLeadsToInvalid(transactionalPathsToToMark) {
    transactionalPathsToToMark.forEach(transaction => markTransaction(transaction));
}

exports.markTransactionsAsLeadsToInvalid = markTransactionsAsLeadsToInvalid;
