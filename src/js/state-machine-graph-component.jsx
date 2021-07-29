const React = require('react');
const styled = require('styled-components').default;
const css = require('styled-components').css;

const constants = require('./constans').constants;

const GraphAreaDiv = styled.div`
            border:2px solid #000;
            overflow: auto;
`

const GraphDiv = styled.div`
            overflow: hidden;
            height: 500px;
            
            ${props => props.isFullScreen && css`
                height: 90vh;
                width: 95vw;
            `}
`

const GraphResizeButton = styled.button`
            background-color: ${constants.DEFAULT_BUTTON_COLOR};
            color: white;
            border: none;
            border-radius: 12px;
            height: 30px;
            margin: 5px 5px;
            &:hover {
                background-color: ${constants.DEFAULT_HOVERED_BUTTON_COLOR};
            }
`

class Graph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isFullScreen: false};

        this.resizeGraph = this.resizeGraph.bind(this);
    }

    resizeGraph() {
        this.setState(prevState => ({
            isFullScreen: !prevState.isFullScreen
        }));
    }

    render() {
        return (
            <GraphAreaDiv>
                <GraphDiv id={this.props.id} isFullScreen={this.state.isFullScreen}></GraphDiv>
                <GraphResizeButton onClick={this.resizeGraph}>Full screen ON/OF</GraphResizeButton>
            </GraphAreaDiv>
        );
    }
}

exports.Graph = Graph
