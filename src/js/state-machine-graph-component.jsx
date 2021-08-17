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

const GraphButton = styled.button`
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

function saveSvg(svgEl, name) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const svgData = svgEl.outerHTML.replaceAll(/url\(http:[A-Za-z0-9\/:\-.]+/g, "url(");
    const preface = '<?xml version="1.0" standalone="no"?>\r\n';
    const svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

class Graph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isFullScreen: false};

        this.resizeGraph = this.resizeGraph.bind(this);
        this.saveToFile = this.saveToFile.bind(this);
    }

    resizeGraph() {
        this.setState(prevState => ({
            isFullScreen: !prevState.isFullScreen
        }));
    }
    
    saveToFile() {
        const svg = document.querySelector(`#${this.props.id} svg`);
        if(!svg) {
            console.warn("There is no svg to save, please build it first");
            return;
        }

        saveSvg(svg, "state-machine.svg");
    }

    render() {
        return (
            <GraphAreaDiv>
                <GraphDiv id={this.props.id} isFullScreen={this.state.isFullScreen}></GraphDiv>
                <GraphButton onClick={this.resizeGraph}>Full screen ON/OF</GraphButton>
                <GraphButton onClick={this.saveToFile}>Save to file</GraphButton>
            </GraphAreaDiv>
        );
    }
}

exports.Graph = Graph
