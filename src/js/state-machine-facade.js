const constants = require('./constans').constants;

const buildStateMachineTransactions = require('./state-machine-transactions-builder.js').build;
const renderStateMachineGraph = require('./state-machine-graph').renderStateMachineGraph;

exports.facade = {
    buildTransactions: stateMachineDefinition => buildStateMachineTransactions(stateMachineDefinition),
    renderGraph: transactions => renderStateMachineGraph(`#${constants.GRAPH_ID}`, transactions)
}
