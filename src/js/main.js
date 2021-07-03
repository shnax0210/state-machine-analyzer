const buildStates = require('./states-builder').buildStates;
const selectionsTypes = require('./states-builder').selectionsTypes;
const buildTransactions = require('./transactions-builder').buildTransactions;
const showStateMachineGraph = require('./state-machine-graph').showStateMachineGraph;
const markStates = require('./states-marker').markStates;
const _ = require('lodash');

function createStateMachine(buildStatesDescription, stateMarker, eventsInfo) {
    function evaluateStates() {
        if (!buildStatesDescription || !_.isFunction(buildStatesDescription)) {
            console.warn("Build states description function is not defined or is not a function:" + buildStatesDescription);
            return {};
        }

        let states = buildStates(buildStatesDescription());

        if (!stateMarker || !_.isFunction(stateMarker.markState)) {
            console.warn("State marker is not defined or defined in wrong way:" + stateMarker);
            return states;
        }

        return markStates(states, stateMarker.possibleMarks, stateMarker.markState);
    }

    function evaluateTransactions(states) {
        if (!eventsInfo || !eventsInfo.events) {
            console.warn("Event builder is not defined or defined in wrong way:" + eventsInfo);
            return [];
        }

        return buildTransactions(eventsInfo.events, states, eventsInfo.marks)
    }

    const stateMachine = {};
    stateMachine.states = evaluateStates();
    stateMachine.transactions = evaluateTransactions(stateMachine.states)

    return {
        render: function (cvgElementId) {
            showStateMachineGraph(cvgElementId, stateMachine);
        }
    }
}

window.createStateMachine = createStateMachine;
