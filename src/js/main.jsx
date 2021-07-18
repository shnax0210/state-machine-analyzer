const React = require('react');
const ReactDOM = require('react-dom');

const Editor = require('./state-machine-editor-component.jsx').Editor;

const buildStateMachine = require('./state-machine-builder').build;
const renderStateMachineGraph = require('./state-machine-graph').renderStateMachineGraph;


ReactDOM.render(
    <Editor isCodeSavingEnabled="true"/>,
    document.getElementById('test')
);

function updateStateMachine(stateMachineDefinition, containerSelector) {
    renderStateMachineGraph(containerSelector, buildStateMachine(stateMachineDefinition));
}

window.updateStateMachine = updateStateMachine;
