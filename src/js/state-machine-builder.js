const _ = require('lodash');

const INITIAL_STATE_MARK = {
    label: "Initial",
    color: "blue"
}

const VALID_STATE_MARK = {
    label: "Valid",
    color: "green"
}

const INVALID_STATE_MARK = {
    label: "InValid",
    color: "red"
}

const NOT_VALID_STEP_FAIL = "NOT_VALID_STEP_FAIL";

function findState(states, stateObject) {
    const foundState = states.find(state => _.isEqual(state.stateObject, stateObject));
    return foundState ? foundState : null;
}

function createState(stateId, stateObject, stateMark) {
    return {
        id: stateId,
        stateObject: stateObject,
        mark: stateMark
    }
}

function prepareInitialStates(initialStateObjects) {
    return initialStateObjects.map((stateObject, index) => createState(index, stateObject, INITIAL_STATE_MARK));
}

function defineMark(stateObject, isStateValid) {
    return isStateValid(stateObject) ? VALID_STATE_MARK : INVALID_STATE_MARK;
}

function createStateAndRegister(existingStates, stateObject, isStateValid) {
    const newState = createState(existingStates.length, stateObject, defineMark(stateObject, isStateValid));
    existingStates.push(newState);
    return newState;
}

function findOrCreateState(existingStates, stateObject, isStateValid) {
    const existingState = findState(existingStates, stateObject);
    if (existingState) {
        return [existingState, false]
    }

    return [createStateAndRegister(existingStates, stateObject, isStateValid), true];
}

function createTransaction(event, fromState, toState) {
    return {
        name: event.name,
        from: fromState.id,
        to: toState.id
    }
}

function isStopNeeded(toState, stateMachineDefinition) {
    return !stateMachineDefinition.continueOnInvalidState && _.isEqual(toState.mark, INVALID_STATE_MARK);
}

function checkAndAdjustStateMachineDefinition(stateMachineDefinition) {
    if (!stateMachineDefinition) {
        throw `State machine definition was not provided: ${stateMachineDefinition}`;
    }

    if (!stateMachineDefinition.initialStates) {
        throw `No initial states were provided: ${stateMachineDefinition.initialStates}`;
    }

    if (!stateMachineDefinition.events) {
        throw `No events were provided: ${stateMachineDefinition.events}`;
    }

    if (stateMachineDefinition.isStateValid && !_.isFunction(stateMachineDefinition.isStateValid)) {
        throw `isStateValid should be a function but was provided: ${stateMachineDefinition.isStateValid}`;
    }

    if (!stateMachineDefinition.isStateValid) {
        console.info("isStateValid function was not provided, default one will be used")
        stateMachineDefinition.isStateValid = () => true;
    }
}

function build(stateMachineDefinition) {
    checkAndAdjustStateMachineDefinition(stateMachineDefinition);
    
    const achievedStates = prepareInitialStates(stateMachineDefinition.initialStates)
    let inProcessStates = _.cloneDeep(achievedStates)

    const transactions = []

    try {
        while (inProcessStates.length) {
            const statesForNextProcessing = [];
            inProcessStates.forEach(fromState => {
                stateMachineDefinition.events.forEach(event => {
                    const toStateObject = _.cloneDeep(fromState.stateObject)
                    event.handle(toStateObject);

                    if (!_.isEqual(fromState.stateObject, toStateObject)) {
                        let [toState, isNewState] = findOrCreateState(achievedStates, toStateObject, stateMachineDefinition.isStateValid);

                        transactions.push(createTransaction(event, fromState, toState))
                        if (isNewState) statesForNextProcessing.push(toState);

                        if (isStopNeeded(toState, stateMachineDefinition)) {
                            throw NOT_VALID_STEP_FAIL
                        }
                    }
                })
            })
            inProcessStates = statesForNextProcessing;
        }
    } catch (err) {
        if (err !== NOT_VALID_STEP_FAIL) {
            throw err;
        }
    }

    return {
        states: achievedStates,
        transactions: transactions
    };
}

exports.build = build;
