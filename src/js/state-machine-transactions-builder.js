const _ = require('lodash');
const stateMarks = require('./constans.js').stateMarks;
const transactionMarks = require('./constans.js').transactionMarks;

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

function createTransaction(command, fromStateWrapper, toStateWrapper, isTransactionValid) {
    const transaction = {
        name: command.name,
        from: fromStateWrapper,
        to: toStateWrapper
    };

    transaction.mark = defineTransactionMark(transaction, isTransactionValid);
    return transaction;
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
    
    const achievedStateWrappers = prepareInitialStateWrappers(stateMachineDefinition.initialStates);
    let inProcessStateWrappers = _.cloneDeep(achievedStateWrappers);

    const transactions = [];

    try {
        while (inProcessStateWrappers.length) {
            const stateWrappersForNextProcessing = [];
            inProcessStateWrappers.forEach(fromStateWrapper => {
                stateMachineDefinition.commands.forEach(command => {
                    const toState = _.cloneDeep(fromStateWrapper.state)
                    command.handle(toState);

                    if (!_.isEqual(fromStateWrapper.state, toState)) {
                        const [toStateWrapper, isNewStateWrapper] = findOrCreateStateWrapper(achievedStateWrappers, toState, stateMachineDefinition.isStateValid);
                        const transaction = createTransaction(command, fromStateWrapper, toStateWrapper, stateMachineDefinition.isTransactionValid);
                        
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
    
    return transactions;
}

exports.build = build;
