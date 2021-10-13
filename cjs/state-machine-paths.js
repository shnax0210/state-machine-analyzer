const _ = require('lodash');

const findAllPaths = require('./graph-all-paths-between-nodes.js').findAllPaths;

const stateMarks = require('./constans.js').stateMarks;
const transactionMarks = require('./constans.js').transactionMarks;
const collectStates = require('./state-machine-states-collector.js').collectStates;

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

function buildPathsResponse(paths, disableStatsPrint) {
    const result = {};

    function buildAllLengths() {
        const info = {};

        paths.forEach(path => {
            if(!info[path.length]) {
                info[path.length] = {
                    count: 0
                };
                info[path.length].length = path.length;
            }

            info[path.length].count = info[path.length].count + 1;
        })

        return Object.values(info).sort(pathInfo => pathInfo.length);
    }

    result.stat = {
        count: paths.length,
        minLength: Math.min(...paths.map(path => path.length)),
        maxLength: Math.max(...paths.map(path => path.length)),
        allLengths: buildAllLengths()
    }

    result.getAll = () => paths;
    result.getMin = () => paths.filter(path => path.length === result.stat.minLength);
    result.getMax = () => paths.filter(path => path.length === result.stat.maxLength);
    
    if(!disableStatsPrint) {
        console.info(`Found paths statistic: ${JSON.stringify(result.stat)}`) 
    }

    return result;
}

function findTransactionalPaths(sourceStateWrappers, destinationStateWrappers, transactions) {
    if(!sourceStateWrappers) {
        sourceStateWrappers = findInitialStateWrappers(transactions);
    }
    
    if(!_.isArray(sourceStateWrappers)) sourceStateWrappers = [sourceStateWrappers];
    if(!_.isArray(destinationStateWrappers)) destinationStateWrappers = [destinationStateWrappers];

    console.info(`Searching paths between: ${JSON.stringify(sourceStateWrappers)} and ${JSON.stringify(destinationStateWrappers)}`);
    
    return buildPathsResponse(sourceStateWrappers.flatMap(sourceStateWrapper => destinationStateWrappers.flatMap(destinationStateWrapper => {
        const graphPaths = findAllPaths(sourceStateWrapper.id, destinationStateWrapper.id, convertTransactionToGraph(transactions));
        return collectTransactionsForGraphPaths(graphPaths, transactions);
    })));
}

function findStateWrappersForInvalidTransactions(transactions) {
    return transactions
        .filter(transaction => transaction === transactionMarks.VALID)
        .map(transaction => transaction.from);
}

function findStateWrappers(transactions, isMatched) {
    return collectStates(transactions).filter(isMatched);
}

function findInitialStateWrappers(transactions) {
    return findStateWrappers(transactions, stateWrapper => stateWrapper.mark === stateMarks.INITIAL);
}

function findInvalidStateWrappers(transactions) {
    const invalidStateWrappers = findStateWrappers(transactions, stateWrapper => stateWrapper.mark === stateMarks.INVALID);
    const stateWrappersForInvalidTransactions = findStateWrappersForInvalidTransactions(transactions);

    return invalidStateWrappers.concat(stateWrappersForInvalidTransactions);
}

function findTransactionPathsBetweenInitialAndInvalidStates(transactions) {
    const initialStateWrappers = findInitialStateWrappers(transactions);
    const invalidStateWrappers = findInvalidStateWrappers(transactions);

    if(!initialStateWrappers.length || !invalidStateWrappers.length) return buildPathsResponse([], true);
    
    return findTransactionalPaths(initialStateWrappers, invalidStateWrappers, transactions);
}

exports.findTransactionalPaths = findTransactionalPaths;
exports.findTransactionPathsBetweenInitialAndInvalidStates = findTransactionPathsBetweenInitialAndInvalidStates;
