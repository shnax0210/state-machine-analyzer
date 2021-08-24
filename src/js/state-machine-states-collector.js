function collectStates(transactions) {
    const stateIds = new Set();
    const states = [];

    function addState(state) {
        if (!stateIds.has(state.id)) {
            stateIds.add(state.id);
            states.push(state);
        }
    }

    transactions.forEach(transaction => {
        addState(transaction.from);
        addState(transaction.to);
    })

    return states;
}

exports.collectStates = collectStates
