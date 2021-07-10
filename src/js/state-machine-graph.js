const d3 = require('d3');
const dagreD3 = require('dagre-d3');

function createSvgGroup(svg) {
    return svg.append("g");
}

function renderGraphToSvg(graph, svg) {
    const render = new dagreD3.render();
    render(createSvgGroup(svg), graph);
}

function findElementAndClean(elementSelector) {
    const element = d3.select(elementSelector);
    element.selectAll("*").remove();
    return element;
}

function createSvg(container) {
    const svg = container.append("svg");
    svg.attr("width", "100%")
    svg.attr("height", "100%")
    svg.attr("preserveAspectRatio", "xMidYMid meet")
    return svg;
}

function adjustGraphSize(graph, svg) {
    svg.attr("viewBox", `0 -10 ${graph.graph().width + 40} ${graph.graph().height + 40}`)
}

function renderGraph(containerSelector, graph) {
    const svg = createSvg(findElementAndClean(containerSelector));
    renderGraphToSvg(graph, svg);
    adjustGraphSize(graph, svg);
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

function renderStateMachineGraph(containerSelector, stateMachine) {
    renderGraph(containerSelector, createStateMachineGraph(stateMachine));
}

exports.renderStateMachineGraph = renderStateMachineGraph;
