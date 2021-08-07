const _ = require('lodash');

const preprocess = require('./state-machine-definition-preprocessing.js').preprocess;
const buildStateMachineTransactions = require('./state-machine-transactions-builder.js').build;
const findTransactionalPathsBetweenInitialAndInvalidStates = require("./state-machine-paths.js").findTransactionalPathsBetweenInitialAndInvalidStates
const markTransactionsAsLeadsToInvalid = require("./state-machine-transaction-paths-marker.js").markTransactionsAsLeadsToInvalid;

function preprocessDefinition(stateMachineDefinition) {
    stateMachineDefinition = _.cloneDeep(stateMachineDefinition);
    preprocess(stateMachineDefinition);
    return stateMachineDefinition;
}

function createStateMachine(stateMachineDefinition) {
    const transactions = buildStateMachineTransactions(preprocessDefinition(stateMachineDefinition));
    const transactionalPathsToInvalidStates = findTransactionalPathsBetweenInitialAndInvalidStates(transactions);

    markTransactionsAsLeadsToInvalid(transactionalPathsToInvalidStates);

    return {
        getTransactions: () => transactions,
        getTransactionalPathsToInvalidStates: () => transactionalPathsToInvalidStates
    }
}

exports.createStateMachine = createStateMachine;
