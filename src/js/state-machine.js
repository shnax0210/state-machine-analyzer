const constants = require('./constans').constants;

const buildStateMachineTransactions = require('./state-machine-transactions-builder.js').build;
const findTransactionalPathsBetweenInitialAndInvalidStates = require("./state-machine-paths.js").findTransactionalPathsBetweenInitialAndInvalidStates
const markTransactionsAsLeadsToInvalid = require("./state-machine-transaction-paths-marker.js").markTransactionsAsLeadsToInvalid;
const renderStateMachineGraph = require('./state-machine-graph').renderStateMachineGraph;


function createStateMachine(stateMachineDefinition) {
    const transactions = buildStateMachineTransactions(stateMachineDefinition);
    const transactionalPathsToInvalidStates = findTransactionalPathsBetweenInitialAndInvalidStates(transactions);

    markTransactionsAsLeadsToInvalid(transactionalPathsToInvalidStates);
    
    return {
        getTransactions: () => transactions,
        getTransactionalPathsToInvalidStates: () => transactionalPathsToInvalidStates,
        renderGraph: () => renderStateMachineGraph(`#${constants.GRAPH_ID}`, transactions)
    }
}

exports.createStateMachine = createStateMachine;
