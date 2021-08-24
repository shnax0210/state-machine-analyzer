const _ = require('lodash');

const preprocess = require('./state-machine-definition-preprocessing.js').preprocess;
const buildStateMachineTransactions = require('./state-machine-transactions-builder.js').build;
const findTransactionPathsBetweenInitialAndInvalidStates = require("./state-machine-paths.js").findTransactionPathsBetweenInitialAndInvalidStates
const findTransactionalPaths = require("./state-machine-paths.js").findTransactionalPaths
const markTransactionsAsLeadsToInvalid = require("./state-machine-transaction-paths-marker.js").markTransactionsAsLeadsToInvalid;
const collectStates = require('./state-machine-states-collector.js').collectStates;

function preprocessDefinition(stateMachineDefinition) {
    stateMachineDefinition = _.cloneDeep(stateMachineDefinition);
    preprocess(stateMachineDefinition);
    return stateMachineDefinition;
}

function collectTransactionsFromPaths(paths) {
    const result = [];
    const ids = new Set();

    paths.flatMap(path => path).forEach(transaction => {
        if(!ids.has(transaction.id)) {
            result.push(transaction);
            ids.add(transaction.id);
        }
    })
    
    return result;
}

function buildTransactions(input) {
    if(_.isArray(input)) {
        if(input.length && _.isArray(input[0])) {
            return collectTransactionsFromPaths(input);
        }
        
        return input;
    }
    
    return buildStateMachineTransactions(preprocessDefinition(input));
}

function createStateMachine(input) {
    const transactions = buildTransactions(input);
    const wrappedStates = collectStates(transactions);
    const transactionPathsToInvalidStates = findTransactionPathsBetweenInitialAndInvalidStates(transactions);

    markTransactionsAsLeadsToInvalid(transactionPathsToInvalidStates.getAll());
    
    return {
        getTransactions: () => transactions,
        getWrappedStates: () => wrappedStates,
        findPathsToInvalidStates: () => transactionPathsToInvalidStates,
        findPaths: (destinationStates, sourceStates) => findTransactionalPaths(sourceStates, destinationStates, transactions)
    }
}

exports.createStateMachine = createStateMachine;
