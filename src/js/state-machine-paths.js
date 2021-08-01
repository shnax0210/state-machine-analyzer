const findAllPaths = require('./graph-all-paths-between-nodes.js').findAllPaths;

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

function findAllTransactionalPaths(sourceStateWrapper, destinationStateWrapper, transactions) {
    const graphPaths = findAllPaths(sourceStateWrapper.id, destinationStateWrapper.id, convertTransactionToGraph(transactions));
    return collectTransactionsForGraphPaths(graphPaths, transactions);
}

exports.findAllTransactionalPaths = findAllTransactionalPaths;
