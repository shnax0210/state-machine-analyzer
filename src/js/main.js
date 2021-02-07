const buildStates = require('./states-builder').buildStates;
const selectionsTypes = require('./states-builder').selectionsTypes;
const buildTransactions = require('./transactions-builder').buildTransactions;
const showStateMachineGraph = require('./state-machine-graph').showStateMachineGraph;
const markStates = require('./states-marker').markStates;


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


function registerUser(state, id) {
    if (Array.from(state.users).map(user => user.id).includes(id)) {
        return;
    }

    state.users.add({id: id, products: new Set()})
}

function buyProduct(state, userId, productId) {
    const users = Array.from(state.users);
    if (!users.map(user => user.id).includes(userId)) {
        return;
    }

    users.find(user => user.id === userId).products.add(productId);
}

const events = [
    {
        name: "RegistrationUser1",
        handle: function (state) {
            registerUser(state, "user1");
        }
    },
    {
        name: "RegistrationUser2",
        handle: function (state) {
            registerUser(state, "user2");
        }
    },
    {
        name: "User1BuyProduct1",
        handle: function (state) {
            buyProduct(state, "user1", "product1");
        }
    },
    {
        name: "User1BuyProduct2",
        handle: function (state) {
            buyProduct(state, "user1", "product2");
        }
    },
    {
        name: "User2BuyProduct1",
        handle: function (state) {
            buyProduct(state, "user2", "product1");
        }
    },
    {
        name: "User2BuyProduct2",
        handle: function (state) {
            buyProduct(state, "user2", "product2");
        }
    }
]


let states = markStates(buildStates(statesDescription));

const stateMachine = {
    states: states,
    transactions: buildTransactions(events, states)
}

console.log(JSON.stringify(stateMachine));

showStateMachineGraph("#stateMachineSvg", stateMachine);
