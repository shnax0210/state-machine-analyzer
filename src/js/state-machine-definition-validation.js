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

function checkEventsDefinition(stateMachineDefinition) {
    if (!stateMachineDefinition.events) {
        throw new Error(`"events" property should be array but is not defined: ${stateMachineDefinition.events}`);
    }

    if (!_.isArray(stateMachineDefinition.events)) {
        throw new Error(`"events" property should be array but it is: ${stateMachineDefinition.events}`);
    }

    stateMachineDefinition.events.forEach(event => {
        if (!event.name) {
            throw new Error(`Event "name" property is not defined: ${event.name}`);
        }

        if (!_.isString(event.name)) {
            throw new Error(`Event "name" property is not a string: ${event.name}`);
        }

        if (!event.handle) {
            throw new Error(`Event "handle" property is not defined: ${event.handle}, for event with name: ${event.name}`);
        }

        if (!_.isFunction(event.handle)) {
            throw new Error(`Event "handle" property is not a function: ${event.handle}, for event with name: ${event.name}`);
        }
    });
}

function checkAndAdjustIsStateValidFunction(stateMachineDefinition) {
    if (stateMachineDefinition.isStateValid && !_.isFunction(stateMachineDefinition.isStateValid)) {
        throw new Error(`"isStateValid" property should be a function: ${stateMachineDefinition.isStateValid}`);
    }

    if (!stateMachineDefinition.isStateValid) {
        console.info(`"isStateValid" function was not provided, default one will be used`)
        stateMachineDefinition.isStateValid = () => true;
    }
}

function checkAndAdjustIsTransactionValidFunction(stateMachineDefinition) {
    if (stateMachineDefinition.isTransactionValid && !_.isFunction(stateMachineDefinition.isTransactionValid)) {
        throw new Error(`"isTransactionValid" property should be a function: ${stateMachineDefinition.isTransactionValid}`);
    }

    if (!stateMachineDefinition.isTransactionValid) {
        console.info(`"isTransactionValid" function was not provided, default one will be used`)
        stateMachineDefinition.isTransactionValid = () => true;
    }
}

function checkAndAdjustStateMachineDefinition(stateMachineDefinition) {
    [checkBaseStateMachineDefinition,
        checkInitialStatesDefinition,
        checkEventsDefinition,
        checkAndAdjustIsStateValidFunction,
        checkAndAdjustIsTransactionValidFunction].forEach(check => check(stateMachineDefinition))
}

exports.checkAndAdjustStateMachineDefinition = checkAndAdjustStateMachineDefinition;
