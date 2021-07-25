const React = require('react');
const styled = require('styled-components').default;
const css = require('styled-components').css;

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
            background-color: #008CBA;
            color: white;
            border: none;
            border-radius: 12px;
            height: 30px;
            margin: 5px 5px;
`

const graphStyles = `
g.graph--node_red > rect {
    fill: #ff0000;
}

g.graph--node_cyan > rect {
    fill: #00FFFF;
}

g.graph--node_blue > rect {
    fill: #0000FF;
}

g.graph--node_purple > rect {
    fill: #800080;
}

g.graph--node_yellow > rect {
    fill: #FFFF00;
}

g.graph--node_lime > rect {
    fill: #00FF00;
}

g.graph--node_magenta > rect {
    fill: #FF00FF;
}

g.graph--node_white > rect {
    fill: #FFFFFF;
}

g.graph--node_silver > rect {
    fill: #C0C0C0;
}

g.graph--node_gray > rect {
    fill: #808080;
}

g.graph--node_black > rect {
    fill: #000000;
}

g.graph--node_orange > rect {
    fill: #FFA500;
}

g.graph--node_brown > rect {
    fill: #A52A2A;
}

g.graph--node_maroon > rect {
    fill: #800000;
}

g.graph--node_green > rect {
    fill: #008000;
}

g.graph--node_olive > rect {
    fill: #808000;
}

.edgePath path {
    stroke: #333;
    stroke-width: 1.5px;
}
`

const GRAPH_STYLE_ID = "graphStyles";

function loadGraphCss() {
    const style = document.createElement('style');
    style.id = GRAPH_STYLE_ID;
    style.textContent = graphStyles;

    document.head.append(style);
}

function unloadGraphCss() {
    document.getElementById(GRAPH_STYLE_ID).remove();
}

class Graph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isFullScreen: false};

        this.resizeGraph = this.resizeGraph.bind(this);
    }

    componentDidMount() {
        loadGraphCss();
    }

    componentWillUnmount() {
        unloadGraphCss();
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
