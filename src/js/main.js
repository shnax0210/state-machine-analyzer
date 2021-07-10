const buildStates = require('./states-builder').buildStates;
const buildTransactions = require('./transactions-builder').buildTransactions;
const renderStateMachineGraph = require('./state-machine-graph').renderStateMachineGraph;
const markStates = require('./states-marker').markStates;
const _ = require('lodash');

function createStateMachine(stateMachineDefinition) {
    function evaluateStates() {
        if (!stateMachineDefinition.statesDescription) {
            console.warn("There is not statesDescription: " + JSON.stringify(stateMachineDefinition));
            return {};
        }

        let states = buildStates(stateMachineDefinition.statesDescription);

        if (!_.isFunction(stateMachineDefinition.markState)) {
            console.warn("Mark state function is missing or is not a function: " + JSON.stringify(stateMachineDefinition));
            return states;
        }

        return markStates(states, stateMachineDefinition.marks, stateMachineDefinition.markState);
    }

    function evaluateTransactions(states) {
        if (!stateMachineDefinition.events) {
            console.warn("There is no events: " + JSON.stringify(stateMachineDefinition));
            return [];
        }

        return buildTransactions(stateMachineDefinition.events, states, stateMachineDefinition.marksThatEventsWillBeAppliedTo)
    }

    const stateMachine = {};
    stateMachine.states = evaluateStates();
    stateMachine.transactions = evaluateTransactions(stateMachine.states)

    return {
        render: function (containerSelector) {
            renderStateMachineGraph(containerSelector, stateMachine);
        }
    }
}

window.createStateMachine = createStateMachine;
