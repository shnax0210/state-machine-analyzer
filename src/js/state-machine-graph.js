const d3 = require('d3');
const dagreD3 = require('dagre-d3');
const stateMarks = require('./constans.js').stateMarks;
const actionMarks = require('./constans.js').actionMarks;

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

function convertActionMarkToStyles(mark) {
    if(mark === actionMarks.VALID) return ["fill: #333", "stroke: #333; stroke-width: 1.5px; fill: none;"];
    if(mark === actionMarks.INVALID) return ["fill: #ff0000", "stroke: #ff0000; stroke-width: 5px; fill: none;"];
    if(mark === actionMarks.LEADS_TO_INVALID) return ["fill: #f75723", "stroke: #f75723; stroke-width: 4px; fill: none;"];

    throw new Error(`Unknown action mark: ${mark}`);
}

function addActionToGraph(action, graph) {
    const [arrowheadStyle, style] = convertActionMarkToStyles(action.mark);
    graph.setEdge(action.from.id, action.to.id, {
        label: action.name, 
        arrowheadStyle: arrowheadStyle, 
        style: style
    });
}

function addActionsToGraph(graph, actions) {
    actions.forEach(action => addActionToGraph(action, graph));
}

function collectStates(actions) {
    const stateIds = new Set();
    const states = [];

    function addState(state) {
        if (!stateIds.has(state.id)) {
            stateIds.add(state.id);
            states.push(state);
        }
    }

    actions.forEach(action => {
        addState(action.from);
        addState(action.to);
    })

    return states;
}

function createStateMachineGraph(actions) {
    if (!actions || !actions.length) {
        throw new Error(`There should be at least one action but: ${actions} was provided`);
    }

    const graph = new dagreD3.graphlib.Graph().setGraph({})

    addStatesToGraph(graph, collectStates(actions));
    addActionsToGraph(graph, actions);

    return graph;
}

function renderStateMachineGraph(containerSelector, stateMachineActions) {
    renderGraph(containerSelector, createStateMachineGraph(stateMachineActions));
}

exports.renderStateMachineGraph = renderStateMachineGraph;
