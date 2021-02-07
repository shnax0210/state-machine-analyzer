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

function determineArrayEndOffset(array, currentOffset) {
    if (!array || !array.length) {
        return "";
    }

    if (array[0] && typeof array[0] === "object") {
        return currentOffset;
    }

    return "";
}

function formatObject(object, offset) {
    if (object instanceof Set) {
        return `[${Array.from(object).map(element => formatObject(element, offset + "\t"))}${determineArrayEndOffset(object, offset)}]`;
    }

    if (object && typeof object === "object") {
        return `{\n${createStateLabel(object, offset + "\t")}\n${offset}}\n`
    }

    return `${object}`
}

function createStateLabel(state, offset) {
    if (!offset) {
        offset = "";
    }

    return Object.entries(state)
        .map(attributeToValue => {
            return `${offset}${attributeToValue[0]}=${formatObject(attributeToValue[1], offset)}`
        })
        .join("\n");
}

function addStatesToGraph(graph, states, nodeClass) {
    if (!states || !Object.entries(states).length) {
        return;
    }

    Object.entries(states)
        .forEach(idToState => graph.setNode(idToState[0], {
            label: createStateLabel(idToState[1]),
            class: nodeClass
        }));
}

function addTransactionToGraph(transaction, graph) {
    graph.setEdge(transaction.from, transaction.to, {label: transaction.name});
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
        "id1": {
            user: {
                id: "user1",
                name: "Ivan"
            },
            product: "product1"
        },
        "id2": {
            user: null,
            product: null
        }
    },
    invalidStates: {
        "id3": {
            user: null,
            product: "product1"
        }
    },
    transactions: [
        {
            name: "Login",
            from: "id2",
            to: "id1"
        },
        {
            name: "Logout",
            from: "id1",
            to: "id2"
        },

    ]
}

exports.showStateMachineGraph = showStateMachineGraph;
exports.stateMachineExample = stateMachineExample;