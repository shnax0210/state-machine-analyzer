const _ = require('lodash');

function selectStateMark(state, allMarks, selectStateMarkLabel) {
    const selectedMarkLabel = selectStateMarkLabel(state);

    if (!selectStateMarkLabel) {
        console.warn("selectStateMarkLabel function does not return mark for state=" + JSON.stringify(state));
        return null;
    }

    const selectedMark = allMarks.find(mark => mark.label === selectedMarkLabel);

    if (!selectedMark) {
        console.warn(`There is no mark with label=${selectedMarkLabel} in all available marks=${JSON.stringify(allMarks)}`);
        return null;
    }

    return selectedMark;
}

function markStates(states, allMarks, selectStateMarkLabel) {
    if (!selectStateMarkLabel) {
        console.warn("selectMark function is not defined, marks will be not assigned to states")
        return states;
    }

    if (!allMarks) {
        console.warn("There are no defined marks, so they will be not assigned to states")
        return states;
    }

    return states.map(state => {
        const stateCopy = _.cloneDeep(state)
        stateCopy.mark = selectStateMark(state, allMarks, selectStateMarkLabel);
        return stateCopy;
    })
}

exports.markStates = markStates;