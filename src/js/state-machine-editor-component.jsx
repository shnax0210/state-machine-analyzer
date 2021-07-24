const React = require('react');
const styled = require('styled-components').default;

const Graph = require('./state-machine-graph-component.jsx').Graph;

const stateMachineFacade = require('./state-machine-facade.js').facade;

const constants = require('./constans').constants;

function addCodeSaving(editor, variableNameForCodeSaving) {
    editor.getSession().on('change', () => window.localStorage.setItem(variableNameForCodeSaving, editor.getValue()));

    const savedCode = window.localStorage.getItem(variableNameForCodeSaving);
    if (savedCode) editor.setValue(savedCode);
}

function createAceEditor(elementId, isCodeSavingEnabled) {
    const editor = window.ace.edit(elementId);
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/javascript");

    if (isCodeSavingEnabled) {
        addCodeSaving(editor, elementId + "savedCode");
    }

    return editor;
}

const EDITOR_ID = "stateMachineEditorId";

const EditorDiv = styled.div`
    height: 350px;
`;

const RunButton = styled.button`
            background-color: #008CBA;
            margin: 15px 0;
            height: 30px;
            width: 100%;
            color: white;
            border: none;
            border-radius: 12px;
`;

const ErrorAlertDiv = styled.button`
            padding: 15px;
            background-color: #f44336;
            margin-bottom: 15px;
            color: white;
            border-radius: 12px;
            width: 100%
`

class ErrorAlert extends React.Component {
    render() {
        return (
            <ErrorAlertDiv>
                <strong>Error!</strong> Please check dev tool console for details.
            </ErrorAlertDiv>
        );
    }
}

class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false};
        this.runEditorCode = this.runEditorCode.bind(this);
    }

    componentDidMount() {
        this.aceEditor = createAceEditor(EDITOR_ID, this.props.isCodeSavingEnabled);
        if (this.props.prepopulatedCode) {
            this.aceEditor.setValue(this.props.prepopulatedCode);
        }
    }

    componentDidUpdate() {
        if (this.props.prepopulatedCode) {
            this.aceEditor.setValue(this.props.prepopulatedCode);
        }
    }
    
    runEditorCode() {
        try {
            this.setState({hasError: false});
            (new Function("facade", this.aceEditor.getValue()))(stateMachineFacade);
        } catch (err) {
            this.setState({hasError: true});
            throw err;
        }
    }

    render() {
        return (
            <div>
                <EditorDiv id={EDITOR_ID}/>
                <RunButton onClick={this.runEditorCode}>Run code</RunButton>
                {this.state.hasError ? <ErrorAlert/> : ""}
                <Graph id={constants.GRAPH_ID}/>
            </div>
        );
    }
}

exports.Editor = Editor