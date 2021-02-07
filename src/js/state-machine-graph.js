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

function buildStateCssClass(stateMark) {
    return `graph--node_${stateMark.color}`
}

function addStatesToGraph(graph, states) {
    if (!states) {
        return;
    }

    states.forEach(state => graph.setNode(state.id, {
        label: createStateLabel(state.stateObject),
        class: buildStateCssClass(state.mark)
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

    addStatesToGraph(graph, stateMachine.states)
    addTransactionsToGraph(graph, stateMachine);

    return graph;
}

function showStateMachineGraph(svgSelector, stateMachine) {
    renderGraph(svgSelector, createStateMachineGraph(stateMachine));
}

exports.showStateMachineGraph = showStateMachineGraph;