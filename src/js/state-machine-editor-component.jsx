const React = require('react');
const styled = require('styled-components').default;

const Graph = require('./state-machine-graph-component.jsx').Graph;

const stateMachineFacade = require('./state-machine-facade.js').facade;

const constants = require('./constans').constants;

const createLogRedirector = require('./log-redirector.js').createLogRedirector

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
const LOG_CONTAINER_ID = "stateMachineLogId";
const LOG_ID = "stateMachineLogId";

const editorHeight = "100%";

const EditorDiv = styled.div`
    width: 90%
`;

const RunButton = styled.button`
            background-color: ${constants.DEFAULT_BUTTON_COLOR};
            height: ${editorHeight};
            width: 10%;
            color: white;
            border: none;
            &:hover {
                background-color: ${constants.DEFAULT_HOVERED_BUTTON_COLOR};
            }
`;

const EditorArea = styled.div`
    border:2px solid #000;
    height: 98vh;
`

const EditorContainer = styled.div`
    display: flex;
    justify-content: space-around;
    height: 65%
`

const BottomPanelContainer = styled.div`
    display: flex;
    justify-content: space-around;
    height: 35%;
`

const ConsoleContainer = styled.div`
            overflow: auto;
            width: 50%
`

const GraphContainer = styled.div`
    width: 50%;
    overflow: auto;
    border-left:2px solid #000;
`

function loadAce() {
    return new Promise((resolve, reject) => {
        if(window.ace) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = `${window.stateMachineScriptHost}/lib/ace-builds-master/src-noconflict/ace.js`;
        script.type = "text/javascript";
        script.onload = () => resolve();

        document.body.append(script);
    });
}

class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.runEditorCode = this.runEditorCode.bind(this);
    }

    componentDidMount() {
        this.aceLoad = loadAce();
        this.aceLoad.then(() => {
            this.aceEditor = createAceEditor(EDITOR_ID, this.props.isCodeSavingEnabled);
            if (this.props.prepopulatedCode) {
                this.aceEditor.setValue(this.props.prepopulatedCode);
            }
        })
    }

    componentDidUpdate(prevProps) {
        if(prevProps.prepopulatedCode === this.props.prepopulatedCode) {
            return;
        }
        
        this.aceLoad.then(() => {
            if (this.props.prepopulatedCode) {
                this.aceEditor.setValue(this.props.prepopulatedCode);
            }
        });
    }
    
    runEditorCode() {
        const logRedirector = createLogRedirector(LOG_ID, LOG_CONTAINER_ID);
        try {
            logRedirector.redirectLogsToElement();
            (new Function("facade", this.aceEditor.getValue()))(stateMachineFacade);
        } catch (err) {
            console.error(err);
        } finally {
            logRedirector.cleanRedirection();
        }
    }

    render() {
        return (
            <EditorArea>
                <EditorContainer>
                    <EditorDiv id={EDITOR_ID}/>
                    <RunButton onClick={this.runEditorCode}>Run code</RunButton>
                </EditorContainer>
                <BottomPanelContainer>
                    <ConsoleContainer id={LOG_CONTAINER_ID}>
                        <pre id={LOG_ID}></pre>
                    </ConsoleContainer>
                    <GraphContainer>
                        <Graph id={constants.GRAPH_ID}/>
                    </GraphContainer>
                </BottomPanelContainer>
            </EditorArea>
        );
    }
}

exports.Editor = Editor
