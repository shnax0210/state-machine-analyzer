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

function checkCommandsDefinition(stateMachineDefinition) {
    if (!stateMachineDefinition.commands) {
        throw new Error(`"commands" property should be array but is not defined: ${stateMachineDefinition.commands}`);
    }

    if (!_.isArray(stateMachineDefinition.commands)) {
        throw new Error(`"commands" property should be array but it is: ${stateMachineDefinition.commands}`);
    }

    stateMachineDefinition.commands.forEach(command => {
        if (!command.name) {
            throw new Error(`command "name" property is not defined: ${command.name}`);
        }

        if (!_.isString(command.name)) {
            throw new Error(`command "name" property is not a string: ${command.name}`);
        }

        if (!command.handle) {
            throw new Error(`command "handle" property is not defined: ${command.handle}, for command with name: ${command.name}`);
        }

        if (!_.isFunction(command.handle)) {
            throw new Error(`command "handle" property is not a function: ${command.handle}, for command with name: ${command.name}`);
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
        checkCommandsDefinition,
        checkAndPreprocessIsStateValidFunction,
        checkAndPreprocessIsActionValidFunction].forEach(check => check(stateMachineDefinition))
}

exports.preprocess = preprocess;
