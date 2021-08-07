const findAllPaths = require('./graph-all-paths-between-nodes.js').findAllPaths;

const stateMarks = require('./constans.js').stateMarks;
const actionMarks = require('./constans.js').actionMarks;

function convertActionToGraph(actions) {
    const graph = {};

    actions.forEach(action => {
        if (!graph[action.from.id]) {
            graph[action.from.id] = [];
        }

        if(!graph[action.from.id].includes(action.to.id)) {
            graph[action.from.id].push(action.to.id);
        }
    })
    
    return graph;
}

function findActionsBetweenState(sourceStateId, destinationStateId, actions) {
    return actions.filter(action => action.from.id === sourceStateId && action.to.id === destinationStateId);
}

function createNewActionSequence(actionSequence, newAction) {
    const newActionSequence = Array.from(actionSequence);
    newActionSequence.push(newAction);
    return newActionSequence;
}

function collectActionsForGraphPath(graphPath, actions) {
    let actionSequences = findActionsBetweenState(graphPath[0], graphPath[1], actions).map(action => [action]);
    
    for (let pathIndex = 1; pathIndex < graphPath.length - 1; ++pathIndex) {
        actionSequences = findActionsBetweenState(graphPath[pathIndex], graphPath[pathIndex + 1], actions)
            .flatMap(newAction => actionSequences.map(sequence => createNewActionSequence(sequence, newAction)));
    }
    
    return actionSequences;
}

function collectActionsForGraphPaths(graphPaths, actions) {
    return graphPaths.flatMap(graphPath => collectActionsForGraphPath(graphPath, actions));
}

function findActionalPaths(sourceStateWrapper, destinationStateWrapper, actions) {
    const graphPaths = findAllPaths(sourceStateWrapper.id, destinationStateWrapper.id, convertActionToGraph(actions));
    return collectActionsForGraphPaths(graphPaths, actions);
}

function findStateWrappersForInvalidActions(actions) {
    return actions
        .filter(action => action === actionMarks.VALID)
        .map(action => action.from);
}

function findStateWrappers(actions, extract, mark) {
    return [...new Set(actions
        .map(extract)
        .filter(stateWrapper => stateWrapper.mark === mark))];
}

function findInitialStateWrappers(actions) {
    return findStateWrappers(actions, action => action.from, stateMarks.INITIAL);
}

function findInvalidStateWrappers(actions) {
    const invalidStateWrappers = findStateWrappers(actions, action => action.to, stateMarks.INVALID);
    const stateWrappersForInvalidActions = findStateWrappersForInvalidActions(actions);

    return invalidStateWrappers.concat(stateWrappersForInvalidActions);
}

function findActionPathsBetweenInitialAndInvalidStates(actions) {
    const initialStateWrappers = findInitialStateWrappers(actions);
    const invalidStateWrappers = findInvalidStateWrappers(actions);

    return initialStateWrappers.flatMap(
        initialState => invalidStateWrappers.flatMap(
            finaleState => findActionalPaths(initialState, finaleState, actions)));
}

exports.findActionalPaths = findActionalPaths;
exports.findActionPathsBetweenInitialAndInvalidStates = findActionPathsBetweenInitialAndInvalidStates;
