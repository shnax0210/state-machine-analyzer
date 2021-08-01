const findAllTransactionalPaths = require('./state-machine-paths.js').findAllTransactionalPaths;

const stateMarks = require('./constans.js').stateMarks;
const transactionMarks = require('./constans.js').transactionMarks;

function findInitialStateWrappers(transactions) {
    return [...new Set(transactions
        .map(transaction => transaction.from)
        .filter(stateWrapper => stateWrapper.mark === stateMarks.INITIAL))];
}

function findInvalidStateWrappers(transactions) {
    return [...new Set(transactions
        .map(transaction => transaction.to)
        .filter(stateWrapper => stateWrapper.mark === stateMarks.INVALID))];
}

function findStateWrappersForInvalidTransactions(transactions) {
    return transactions
        .filter(transaction => transaction === transactionMarks.VALID)
        .map(transaction => transaction.from);
}

function findStatesToMarkPathsTo(transactions) {
    const invalidStateWrappers = findInvalidStateWrappers(transactions);
    const stateWrappersForInvalidTransactions = findStateWrappersForInvalidTransactions(transactions);

    return invalidStateWrappers.concat(stateWrappersForInvalidTransactions);
}

function findTransactionSequencesToMark(transactions) {
    const initialStateWrappers = findInitialStateWrappers(transactions);
    const statesToMarkPathsTo = findStatesToMarkPathsTo(transactions)

    return initialStateWrappers.flatMap(
        initialState => statesToMarkPathsTo.flatMap(
            finaleState => findAllTransactionalPaths(initialState, finaleState, transactions)));
}

function markTransaction(transaction) {
    if (transaction.mark === transactionMarks.INVALID) {
        console.log(`Transaction ${JSON.stringify(transaction)} is already marked as invalid and it will be not overridden`);
        return;
    }

    transaction.mark = transactionMarks.LEADS_TO_INVALID;
}

function markTransactionsThatLeadsToInvalid(transactions) {
    findTransactionSequencesToMark(transactions).forEach(
        transactionSequence => transactionSequence.forEach(transaction => markTransaction(transaction)));
}

exports.markTransactionsThatLeadsToInvalid = markTransactionsThatLeadsToInvalid;
