const d3 = require('d3');
const dagreD3 = require('dagre-d3');
const stateMarks = require('./constans.js').stateMarks;
const transactionMarks = require('./constans.js').transactionMarks;

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

function createStateLabel(state) {
    return JSON.stringify(state, null, '\t\t');
}

function convertStateMarkToColor(mark) {
    if(mark === stateMarks.INITIAL) return "#0000FF";
    if(mark === stateMarks.VALID) return "#008000";
    if(mark === stateMarks.INVALID) return "#ff0000";

    throw new Error(`Unknown state mark: ${mark}`);
}

function addStatesToGraph(graph, stateWrappers) {
    if (!stateWrappers) {
        return;
    }

    stateWrappers.forEach(stateWrapper => graph.setNode(stateWrapper.id, {
        label: createStateLabel(stateWrapper.state),
        style: `fill: ${convertStateMarkToColor(stateWrapper.mark)}`
    }));
}

function convertTransactionMarkToStyles(mark) {
    if(mark === transactionMarks.VALID) return ["fill: #333", "stroke: #333; stroke-width: 1.5px; fill: none;"];
    if(mark === transactionMarks.INVALID) return ["fill: #ff0000", "stroke: #ff0000; stroke-width: 5px; fill: none;"];
    if(mark === transactionMarks.LEADS_TO_INVALID) return ["fill: #f75723", "stroke: #f75723; stroke-width: 4px; fill: none;"];

    throw new Error(`Unknown transaction mark: ${mark}`);
}

function addTransactionToGraph(transaction, graph) {
    const [arrowheadStyle, style] = convertTransactionMarkToStyles(transaction.mark);
    graph.setEdge(transaction.from.id, transaction.to.id, {
        label: transaction.name, 
        arrowheadStyle: arrowheadStyle, 
        style: style
    }, transaction.name);
}

function addTransactionsToGraph(graph, transactions) {
    transactions.forEach(transaction => addTransactionToGraph(transaction, graph));
}

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

function createStateMachineGraph(transactions) {
    if (!transactions || !transactions.length) {
        throw new Error(`There should be at least one transaction but: ${transactions} was provided`);
    }

    const graph = new dagreD3.graphlib.Graph({ multigraph: true }).setGraph({})

    addStatesToGraph(graph, collectStates(transactions));
    addTransactionsToGraph(graph, transactions);

    return graph;
}

function renderStateMachineGraph(containerSelector, stateMachineTransactions) {
    renderGraph(containerSelector, createStateMachineGraph(stateMachineTransactions));
}

exports.renderStateMachineGraph = renderStateMachineGraph;
