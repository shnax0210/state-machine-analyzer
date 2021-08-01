const _ = require('lodash');
const stateMarks = require('./constans.js').stateMarks;
const transactionMarks = require('./constans.js').transactionMarks;

const markTransactionsThatLeadsToInvalid = require('./state-machine-transaction-paths-marker.js').markTransactionsThatLeadsToInvalid;

const NOT_VALID_STEP_FAIL = "NOT_VALID_STEP_FAIL";

function findStateWrapper(stateWrappers, state) {
    const foundStateWrapper = stateWrappers.find(stateWrapper => _.isEqual(stateWrapper.state, state));
    return foundStateWrapper ? foundStateWrapper : null;
}

function createStateWrapper(stateId, state, stateMark) {
    return {
        id: stateId,
        state: state,
        mark: stateMark
    }
}

function prepareInitialStateWrappers(initialStates) {
    return initialStates.map((state, index) => createStateWrapper(index, state, stateMarks.INITIAL));
}

function defineMark(stateObject, isStateValid) {
    return isStateValid(stateObject) ? stateMarks.VALID : stateMarks.INVALID;
}

function createStateWrapperAndRegister(existingStateWrappers, state, isStateValid) {
    const newStateWrapper = createStateWrapper(existingStateWrappers.length, state, defineMark(state, isStateValid));
    existingStateWrappers.push(newStateWrapper);
    return newStateWrapper;
}

function findOrCreateStateWrapper(existingStateWrappers, state, isStateValid) {
    const existingStateWrapper = findStateWrapper(existingStateWrappers, state);
    if (existingStateWrapper) {
        return [existingStateWrapper, false]
    }

    return [createStateWrapperAndRegister(existingStateWrappers, state, isStateValid), true];
}

function defineTransactionMark(transaction, isTransactionValid) {
    return isTransactionValid(transaction) ? transactionMarks.VALID : transactionMarks.INVALID;
}

function createTransaction(event, fromStateWrapper, toStateWrapper, isTransactionValid) {
    const transaction = {
        name: event.name,
        from: fromStateWrapper,
        to: toStateWrapper
    };

    transaction.mark = defineTransactionMark(transaction, isTransactionValid);
    return transaction;
}

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

function checkIfStopNeededDueToState(stateWrapper, stateMachineDefinition) {
    if(!stateMachineDefinition.continueOnInvalidState && _.isEqual(stateWrapper.mark, stateMarks.INVALID)) {
        throw NOT_VALID_STEP_FAIL;
    }
}

function checkIfStopNeededDueToTransaction(transaction, stateMachineDefinition) {
    if(!stateMachineDefinition.continueOnInvalidTransaction && _.isEqual(transaction.mark, transactionMarks.INVALID)) {
        throw NOT_VALID_STEP_FAIL;
    }
}

function build(stateMachineDefinition) {
    checkAndAdjustStateMachineDefinition(stateMachineDefinition);
    
    const achievedStateWrappers = prepareInitialStateWrappers(stateMachineDefinition.initialStates);
    let inProcessStateWrappers = _.cloneDeep(achievedStateWrappers);

    const transactions = [];

    try {
        while (inProcessStateWrappers.length) {
            const stateWrappersForNextProcessing = [];
            inProcessStateWrappers.forEach(fromStateWrapper => {
                stateMachineDefinition.events.forEach(event => {
                    const toState = _.cloneDeep(fromStateWrapper.state)
                    event.handle(toState);

                    if (!_.isEqual(fromStateWrapper.state, toState)) {
                        const [toStateWrapper, isNewStateWrapper] = findOrCreateStateWrapper(achievedStateWrappers, toState, stateMachineDefinition.isStateValid);
                        const transaction = createTransaction(event, fromStateWrapper, toStateWrapper, stateMachineDefinition.isTransactionValid);
                        
                        transactions.push(transaction);
                        checkIfStopNeededDueToTransaction(transaction, stateMachineDefinition);
                        
                        if (isNewStateWrapper) {
                            checkIfStopNeededDueToState(toStateWrapper, stateMachineDefinition);
                            stateWrappersForNextProcessing.push(toStateWrapper);
                        }
                    }
                })
            })
            inProcessStateWrappers = stateWrappersForNextProcessing;
        }
    } catch (err) {
        if (err !== NOT_VALID_STEP_FAIL) {
            throw err;
        }
    }

    markTransactionsThatLeadsToInvalid(transactions);
    return transactions;
}

exports.build = build;
