const buildStates = require('./states-builder').buildStates;
const selectionsTypes = require('./states-builder').selectionsTypes;
const showStateMachineGraph = require('./state-machine-graph').showStateMachineGraph;

const userIds = ["user1", "user2"]
const products = ["product1", "product2"]

const statesDescription = {
    users: {
        selectionType: selectionsTypes.ANY_COMBINATION_OF,
        description: {
            id: {
                selectionType: selectionsTypes.ANY_OF,
                unique: true,
                values: userIds
            },
            products: {
                selectionType: selectionsTypes.ANY_COMBINATION_OF,
                values: products
            }
        }
    }
}

const stateMachine = {
    validStates: buildStates(statesDescription)
}

showStateMachineGraph("#stateMachineSvg", stateMachine);
