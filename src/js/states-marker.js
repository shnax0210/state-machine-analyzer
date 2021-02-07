const _ = require('lodash');

const defaultStateMark = {
    label: "Valid",
    color: "lime"
}

function createStateMark(state, createState) {
    if (!createState) {
        return defaultStateMark;
    }

    const stateMark = createState(state);
    return stateMark || defaultStateMark;
}

function markStates(states, createMark) {
    return states.map(state => {
        const stateCopy = _.cloneDeep(state)
        stateCopy.mark = createStateMark(state, createMark);
        return stateCopy;
    })
}

exports.markStates = markStates;