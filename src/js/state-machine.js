const _ = require('lodash');

const checkAndAdjustStateMachineDefinition = require('./state-machine-definition-validation.js').checkAndAdjustStateMachineDefinition;
const buildStateMachineTransactions = require('./state-machine-transactions-builder.js').build;
const findTransactionalPathsBetweenInitialAndInvalidStates = require("./state-machine-paths.js").findTransactionalPathsBetweenInitialAndInvalidStates
const markTransactionsAsLeadsToInvalid = require("./state-machine-transaction-paths-marker.js").markTransactionsAsLeadsToInvalid;

function createStateMachine(stateMachineDefinition) {
    stateMachineDefinition = _.cloneDeep(stateMachineDefinition);
    checkAndAdjustStateMachineDefinition(stateMachineDefinition);

    const transactions = buildStateMachineTransactions(stateMachineDefinition);
    const transactionalPathsToInvalidStates = findTransactionalPathsBetweenInitialAndInvalidStates(transactions);

    markTransactionsAsLeadsToInvalid(transactionalPathsToInvalidStates);

    return {
        getTransactions: () => transactions,
        getTransactionalPathsToInvalidStates: () => transactionalPathsToInvalidStates
    }
}

exports.createStateMachine = createStateMachine;
