const _ = require('lodash');

function checkBaseStateMachineDefinition(stateMachineDefinition) {
    if (!stateMachineDefinition) {
        throw new Error(`State machine definition was not provided: ${stateMachineDefinition}`);
    }
}

function checkInitialStatesDefinition(stateMachineDefinition) {
    if (!stateMachineDefinition.initialStates) {
        throw new Error(`"initialStates" property should be array but is not defined: ${stateMachineDefinition.initialStates}`);
    }

    if (!_.isArray(stateMachineDefinition.initialStates)) {
        throw new Error(`"initialStates" property should be array but it is: ${stateMachineDefinition.initialStates}`);
    }
}

function checkPotentialActionsDefinition(stateMachineDefinition) {
    if (!stateMachineDefinition.potentialActions) {
        throw new Error(`"potentialActions" property should be array but is not defined: ${stateMachineDefinition.potentialActions}`);
    }

    if (!_.isArray(stateMachineDefinition.potentialActions)) {
        throw new Error(`"potentialActions" property should be array but it is: ${stateMachineDefinition.potentialActions}`);
    }

    stateMachineDefinition.potentialActions.forEach(potentialAction => {
        if (!potentialAction.name) {
            throw new Error(`potentialAction "name" property is not defined: ${potentialAction.name}`);
        }

        if (!_.isString(potentialAction.name)) {
            throw new Error(`potentialAction "name" property is not a string: ${potentialAction.name}`);
        }

        if (!potentialAction.handle) {
            throw new Error(`potentialAction "handle" property is not defined: ${potentialAction.handle}, for potentialAction with name: ${potentialAction.name}`);
        }

        if (!_.isFunction(potentialAction.handle)) {
            throw new Error(`potentialAction "handle" property is not a function: ${potentialAction.handle}, for potentialAction with name: ${potentialAction.name}`);
        }
    });
}

function checkAndPreprocessIsStateValidFunction(stateMachineDefinition) {
    if (stateMachineDefinition.isStateValid && !_.isFunction(stateMachineDefinition.isStateValid)) {
        throw new Error(`"isStateValid" property should be a function: ${stateMachineDefinition.isStateValid}`);
    }

    if (!stateMachineDefinition.isStateValid) {
        console.info(`"isStateValid" function was not provided, default one will be used`)
        stateMachineDefinition.isStateValid = () => true;
    }
}

function checkAndPreprocessIsActionValidFunction(stateMachineDefinition) {
    if (stateMachineDefinition.isActionValid && !_.isFunction(stateMachineDefinition.isActionValid)) {
        throw new Error(`"isActionValid" property should be a function: ${stateMachineDefinition.isActionValid}`);
    }

    if (!stateMachineDefinition.isActionValid) {
        console.info(`"isActionValid" function was not provided, default one will be used`)
        stateMachineDefinition.isActionValid = () => true;
    }
}

function preprocess(stateMachineDefinition) {
    [checkBaseStateMachineDefinition,
        checkInitialStatesDefinition,
        checkPotentialActionsDefinition,
        checkAndPreprocessIsStateValidFunction,
        checkAndPreprocessIsActionValidFunction].forEach(check => check(stateMachineDefinition))
}

exports.preprocess = preprocess;
