const constants = require('./constans').constants;

const createStateMachine = require('./state-machine.js').createStateMachine;
const renderStateMachineGraph = require('./state-machine-graph').renderStateMachineGraph;

exports.facade = {
    createStateMachine: (stateMachineDefinition) => createStateMachine(stateMachineDefinition),
    renderGraph: (stateMachine) => renderStateMachineGraph(`#${constants.GRAPH_ID}`, stateMachine.getActions())
}
