const findAllPaths = require('./graph-all-paths-between-nodes.js').findAllPaths;

const stateMarks = require('./constans.js').stateMarks;
const transactionMarks = require('./constans.js').transactionMarks;

function convertTransactionToGraph(transactions) {
    const graph = {};

    transactions.forEach(transaction => {
        if (!graph[transaction.from.id]) {
            graph[transaction.from.id] = [];
        }

        if(!graph[transaction.from.id].includes(transaction.to.id)) {
            graph[transaction.from.id].push(transaction.to.id);
        }
    })
    
    return graph;
}

function findTransactionsBetweenState(sourceStateId, destinationStateId, transactions) {
    return transactions.filter(transaction => transaction.from.id === sourceStateId && transaction.to.id === destinationStateId);
}

function createNewTransactionSequence(transactionSequence, newTransaction) {
    const newTransactionSequence = Array.from(transactionSequence);
    newTransactionSequence.push(newTransaction);
    return newTransactionSequence;
}

function collectTransactionsForGraphPath(graphPath, transactions) {
    let transactionSequences = findTransactionsBetweenState(graphPath[0], graphPath[1], transactions).map(transaction => [transaction]);
    
    for (let pathIndex = 1; pathIndex < graphPath.length - 1; ++pathIndex) {
        transactionSequences = findTransactionsBetweenState(graphPath[pathIndex], graphPath[pathIndex + 1], transactions)
            .flatMap(newTransaction => transactionSequences.map(sequence => createNewTransactionSequence(sequence, newTransaction)));
    }
    
    return transactionSequences;
}

function collectTransactionsForGraphPaths(graphPaths, transactions) {
    return graphPaths.flatMap(graphPath => collectTransactionsForGraphPath(graphPath, transactions));
}

function findTransactionalPaths(sourceStateWrapper, destinationStateWrapper, transactions) {
    const graphPaths = findAllPaths(sourceStateWrapper.id, destinationStateWrapper.id, convertTransactionToGraph(transactions));
    return collectTransactionsForGraphPaths(graphPaths, transactions);
}

function findStateWrappersForInvalidTransactions(transactions) {
    return transactions
        .filter(transaction => transaction === transactionMarks.VALID)
        .map(transaction => transaction.from);
}

function findStateWrappers(transactions, extract, mark) {
    return [...new Set(transactions
        .map(extract)
        .filter(stateWrapper => stateWrapper.mark === mark))];
}

function findInitialStateWrappers(transactions) {
    return findStateWrappers(transactions, transaction => transaction.from, stateMarks.INITIAL);
}

function findInvalidStateWrappers(transactions) {
    const invalidStateWrappers = findStateWrappers(transactions, transaction => transaction.to, stateMarks.INVALID);
    const stateWrappersForInvalidTransactions = findStateWrappersForInvalidTransactions(transactions);

    return invalidStateWrappers.concat(stateWrappersForInvalidTransactions);
}

function findTransactionalPathsBetweenInitialAndInvalidStates(transactions) {
    const initialStateWrappers = findInitialStateWrappers(transactions);
    const invalidStateWrappers = findInvalidStateWrappers(transactions);

    return initialStateWrappers.flatMap(
        initialState => invalidStateWrappers.flatMap(
            finaleState => findTransactionalPaths(initialState, finaleState, transactions)));
}

exports.findTransactionalPaths = findTransactionalPaths;
exports.findTransactionalPathsBetweenInitialAndInvalidStates = findTransactionalPathsBetweenInitialAndInvalidStates;
