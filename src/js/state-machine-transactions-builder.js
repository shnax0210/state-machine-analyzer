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

function createTransactionName(command) {
    if(command.chainName) {
        return `${command.chainName}_${command.name}`;
    }
    
    return command.name;
}

function createTransaction(command, fromStateWrapper, toStateWrapper, isTransactionValid) {
    const transaction = {
        name: createTransactionName(command),
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

function removeItemOnce(arr, value) {
    let index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
}

function wrapChain(chain) {
    if(!chain) {
        return null;
    }
    
    return {
        addNextCommand: (commandName) => chain.nextCommands.push(commandName),
        isNextCommand: (commandName) => chain.nextCommands.includes(commandName),
        hasNextCommands: () => chain.nextCommands.length > 0,
        removeNextCommand: (commandName) => removeItemOnce(chain.nextCommands, commandName),
        state: chain.state
    }
}

function createChain() {
    return {
        nextCommands: [],
        state: {}
    }
}

function isActiveChain(chainName, state) {
    return state.activeChains && state.activeChains[chainName];
}

function isCompletedChain(chainName, state) {
    return state.completedChains && state.completedChains[chainName];
}

function isChainAlreadyExist(command, state) {
    return isActiveChain(command.chainName, state) || isCompletedChain(command.chainName, state);
}

function createAndAddChain(command, state) {
    if(isChainAlreadyExist(command, state)) {
        return null;
    }
    
    const newChain = createChain();
    state.activeChains = state.activeChains || {};
    state.activeChains[command.chainName] = newChain;
    return newChain;
}

function findChainByName(name, state) {
    return isActiveChain(name, state) ? state.activeChains[name] : null;
}

function fetchChain(command, state) {
    if (command.isChainHead) {
        return createAndAddChain(command, state);
    }
    
    if(command.chainName) {
        return findChainByName(command.chainName, state);
    }
    
    return null;
}

function completeChain(state, command) {
    delete state.activeChains[command.chainName];

    state.completedChains = state.completedChains || {};
    const currentNumberOfCompletedChain = state.completedChains[command.chainName] || 0;
    state.completedChains[command.chainName] = currentNumberOfCompletedChain + 1;
}

function handleCommandWithChain(command, state, chainWrapper) {
    if (chainWrapper.isNextCommand(command.name)) {
        chainWrapper.removeNextCommand(command.name);
        command.handle(state, chainWrapper);
    } else if(command.isChainHead) {
        command.handle(state, chainWrapper);
    }

    if (!chainWrapper.hasNextCommands()) {
        completeChain(state, command);
    }
}

function handleCommand(command, state) {
    const chainWrapper = wrapChain(fetchChain(command, state));

    if (chainWrapper) {
        handleCommandWithChain(command, state, chainWrapper);
    } else if(!command.chainName) {
        command.handle(state, null);
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
                    const toState = _.cloneDeep(fromStateWrapper.state);

                    handleCommand(command, toState);

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
