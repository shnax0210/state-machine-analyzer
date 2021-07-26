const React = require('react');
const styled = require('styled-components').default;

const constants = require('./constans').constants;

const Editor = require('./state-machine-editor-component.jsx').Editor;

const EXAMPLES = require('./state-machine-examples.js').EXAMPLES;

const ExampleButton = styled.button`
    background-color: ${constants.DEFAULT_BUTTON_COLOR};
    color: white;
    border: none;
    border-radius: 12px;
    height: 30px;
    margin: 0 15px;
    &:hover {
        background-color: ${constants.DEFAULT_HOVERED_BUTTON_COLOR};
    }
`

const ShownExampleButton = styled(ExampleButton)`
    background-color: ${constants.DEFAULT_SELECTED_BUTTON_COLOR};
`

const AvailableExamplesArea = styled.div`
    display: flex;
    flex-wrap: wrap;
`

class Examples extends React.Component {
    constructor(props) {
        super(props);
        this.state = {shownExample: EXAMPLES[0]};
    }

    showExample(example) {
        this.setState({shownExample: example});
    }

    render() {
        const availableExamples = EXAMPLES.map(example => {
            const ExampleButtonElement = example.name === this.state.shownExample.name ? ShownExampleButton : ExampleButton;
            return <ExampleButtonElement onClick={() => this.showExample(example)}
                                         key={example.name}>{example.name}</ExampleButtonElement>
        })

        return (
            <div>
                <h1>Available examples:</h1>
                <AvailableExamplesArea>
                    {availableExamples}
                </AvailableExamplesArea>
                <h1>Selected example code:</h1>
                <Editor isCodeSavingEnabled={false} prepopulatedCode={this.state.shownExample.code}/>
            </div>
        );
    }
}

exports.Examples = Examples;
