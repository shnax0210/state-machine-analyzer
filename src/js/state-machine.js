const _ = require('lodash');

const preprocess = require('./state-machine-definition-preprocessing.js').preprocess;
const buildStateMachineActions = require('./state-machine-actions-builder.js').build;
const findActionPathsBetweenInitialAndInvalidStates = require("./state-machine-paths.js").findActionPathsBetweenInitialAndInvalidStates
const markActionsAsLeadsToInvalid = require("./state-machine-action-paths-marker.js").markActionsAsLeadsToInvalid;

function preprocessDefinition(stateMachineDefinition) {
    stateMachineDefinition = _.cloneDeep(stateMachineDefinition);
    preprocess(stateMachineDefinition);
    return stateMachineDefinition;
}

function createStateMachine(stateMachineDefinition) {
    const actions = buildStateMachineActions(preprocessDefinition(stateMachineDefinition));
    const actionPathsToInvalidStates = findActionPathsBetweenInitialAndInvalidStates(actions);

    markActionsAsLeadsToInvalid(actionPathsToInvalidStates);

    return {
        getActions: () => actions,
        getActionPathsToInvalidStates: () => actionPathsToInvalidStates
    }
}

exports.createStateMachine = createStateMachine;
