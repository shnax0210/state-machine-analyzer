const d3 = require('d3');
const dagreD3 = require('dagre-d3');

function renderGraph(svgSelector, graph) {
    // Create the renderer
    const render = new dagreD3.render();

    const svg = d3.select(svgSelector);
    const svgGroup = svg.append("g");

    // Run the renderer. This is what draws the final graph.
    render(svgGroup, graph);

    // Center the graph
    const xCenterOffset = (svg.attr("width") - graph.graph().width) / 2;
    svgGroup.attr("transform", "translate(" + xCenterOffset + ", 20)");
    svg.attr("height", graph.graph().height + 40)
}

function createStateLabel(state, offset) {
    if (!offset) {
        offset = "";
    }

    return Object.entries(state)
        .map(attributeToValue => {
            if (attributeToValue[1] && typeof attributeToValue[1] === "object") {
                return `${attributeToValue[0]}={\n${offset}${createStateLabel(attributeToValue[1], offset + "\t")}\n}\n`;
            }

            return `${offset}${attributeToValue[0]}=${attributeToValue[1]}`
        })
        .join("\n");
}

function addStatesToGraph(graph, states, nodeClass) {
    if (!states || !Object.entries(states).length) {
        return;
    }

    Object.entries(states)
        .forEach(hashToState => graph.setNode(hashToState[0], {
            label: createStateLabel(hashToState[1]),
            class: nodeClass
        }));
}

function addTransactionToGraph(transaction, graph) {
    if (!transaction.transitions || !transaction.transitions.length) {
        return;
    }

    transaction.transitions.forEach(transition => {
        graph.setEdge(transition.from, transition.to, {label: transaction.name});
    });
}

function addTransactionsToGraph(graph, stateMachine) {
    if (!stateMachine.transactions || !stateMachine.transactions.length) {
        return;
    }

    stateMachine.transactions.forEach(transaction => addTransactionToGraph(transaction, graph));
}

function createStateMachineGraph(stateMachine) {
    const graph = new dagreD3.graphlib.Graph().setGraph({})

    addStatesToGraph(graph, stateMachine.validStates, "graph--node_valid")
    addStatesToGraph(graph, stateMachine.invalidStates, "graph--node_invalid")
    addTransactionsToGraph(graph, stateMachine);

    return graph;
}

function showStateMachineGraph(svgSelector, stateMachine) {
    renderGraph(svgSelector, createStateMachineGraph(stateMachine));
}

const stateMachineExample = {
    validStates: {
        "hash1": {
            user: {
                id: "user1",
                name: "Ivan"
            },
            product: "product1"
        },
        "hash2": {
            user: null,
            product: null
        }
    },
    invalidStates: {
        "hash3": {
            user: null,
            product: "product1"
        }
    },
    transactions: [
        {
            name: "Login",
            transitions: [
                {
                    from: "hash2",
                    to: "hash1"
                }
            ]
        },
        {
            name: "Logout",
            transitions: [
                {
                    from: "hash1",
                    to: "hash2"
                }
            ]
        },

    ]
}

exports.showStateMachineGraph = showStateMachineGraph;
exports.stateMachineExample = stateMachineExample;