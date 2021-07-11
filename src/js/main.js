const buildStateMachine = require('./state-machine-builder').build;
const renderStateMachineGraph = require('./state-machine-graph').renderStateMachineGraph;

function updateStateMachine(stateMachineDefinition, containerSelector) {
    renderStateMachineGraph(containerSelector, buildStateMachine(stateMachineDefinition));
}

window.updateStateMachine = updateStateMachine;
