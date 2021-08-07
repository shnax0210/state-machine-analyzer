const _ = require('lodash');
const stateMarks = require('./constans.js').stateMarks;
const actionMarks = require('./constans.js').actionMarks;

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

function defineActionMark(action, isActionValid) {
    return isActionValid(action) ? actionMarks.VALID : actionMarks.INVALID;
}

function createAction(potentialAction, fromStateWrapper, toStateWrapper, isActionValid) {
    const action = {
        name: potentialAction.name,
        from: fromStateWrapper,
        to: toStateWrapper
    };

    action.mark = defineActionMark(action, isActionValid);
    return action;
}

function checkIfStopNeededDueToState(stateWrapper, stateMachineDefinition) {
    if(!stateMachineDefinition.continueOnInvalidState && _.isEqual(stateWrapper.mark, stateMarks.INVALID)) {
        throw NOT_VALID_STEP_FAIL;
    }
}

function checkIfStopNeededDueToAction(action, stateMachineDefinition) {
    if(!stateMachineDefinition.continueOnInvalidAction && _.isEqual(action.mark, actionMarks.INVALID)) {
        throw NOT_VALID_STEP_FAIL;
    }
}

function build(stateMachineDefinition) {
    
    const achievedStateWrappers = prepareInitialStateWrappers(stateMachineDefinition.initialStates);
    let inProcessStateWrappers = _.cloneDeep(achievedStateWrappers);

    const actions = [];

    try {
        while (inProcessStateWrappers.length) {
            const stateWrappersForNextProcessing = [];
            inProcessStateWrappers.forEach(fromStateWrapper => {
                stateMachineDefinition.potentialActions.forEach(potentialAction => {
                    const toState = _.cloneDeep(fromStateWrapper.state)
                    potentialAction.handle(toState);

                    if (!_.isEqual(fromStateWrapper.state, toState)) {
                        const [toStateWrapper, isNewStateWrapper] = findOrCreateStateWrapper(achievedStateWrappers, toState, stateMachineDefinition.isStateValid);
                        const action = createAction(potentialAction, fromStateWrapper, toStateWrapper, stateMachineDefinition.isActionValid);
                        
                        actions.push(action);
                        checkIfStopNeededDueToAction(action, stateMachineDefinition);
                        
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
    
    return actions;
}

exports.build = build;
