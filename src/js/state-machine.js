const _ = require('lodash');

const preprocess = require('./state-machine-definition-preprocessing.js').preprocess;
const buildStateMachineTransactions = require('./state-machine-transactions-builder.js').build;
const findTransactionPathsBetweenInitialAndInvalidStates = require("./state-machine-paths.js").findTransactionPathsBetweenInitialAndInvalidStates
const markTransactionsAsLeadsToInvalid = require("./state-machine-transaction-paths-marker.js").markTransactionsAsLeadsToInvalid;

function preprocessDefinition(stateMachineDefinition) {
    stateMachineDefinition = _.cloneDeep(stateMachineDefinition);
    preprocess(stateMachineDefinition);
    return stateMachineDefinition;
}

function createStateMachine(stateMachineDefinition) {
    const transactions = buildStateMachineTransactions(preprocessDefinition(stateMachineDefinition));
    const transactionPathsToInvalidStates = findTransactionPathsBetweenInitialAndInvalidStates(transactions);

    markTransactionsAsLeadsToInvalid(transactionPathsToInvalidStates);

    return {
        getTransactions: () => transactions,
        getTransactionPathsToInvalidStates: () => transactionPathsToInvalidStates
    }
}

exports.createStateMachine = createStateMachine;
