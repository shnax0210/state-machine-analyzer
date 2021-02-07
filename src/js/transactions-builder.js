const _ = require('lodash');

function findStateId(states, state) {
    const foundIdToState = Object.entries(states).find(idToState => _.isEqual(idToState[1], state));
    return foundIdToState ? foundIdToState[0] : null;
}

function buildTransactions(events, states) {
    const transactions = []

    Object.entries(states).forEach(idToState => {
        const stateId = idToState[0];
        const state = idToState[1];

        events.forEach(event => {
            const newState = _.cloneDeep(state)
            event.handle(newState);

            if (!_.isEqual(state, newState)) {
                transactions.push({
                    name: event.name,
                    from: stateId,
                    to: findStateId(states, newState)
                })
            }
        })
    })

    return transactions;
}

exports.buildTransactions = buildTransactions;