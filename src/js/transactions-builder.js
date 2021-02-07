const _ = require('lodash');

function findStateId(states, stateObject) {
    const foundState = states.find(state => _.isEqual(state.stateObject, stateObject));
    return foundState ? foundState.id : null;
}

function buildTransactions(events, states) {
    const transactions = []

    states.forEach(state => {
        events.forEach(event => {
            const newStateObject = _.cloneDeep(state.stateObject)
            event.handle(newStateObject);

            if (!_.isEqual(state.stateObject, newStateObject)) {
                transactions.push({
                    name: event.name,
                    from: state.id,
                    to: findStateId(states, newStateObject)
                })
            }
        })
    })

    return transactions;
}

exports.buildTransactions = buildTransactions;