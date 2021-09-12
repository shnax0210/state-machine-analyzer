const React = require('react');
const styled = require('styled-components').default;
const css = require('styled-components').css;

const constants = require('./constans').constants;

const BUTTON_HEIGHT = 30;

const GraphAreaDiv = styled.div`
            ${props => props.isFullScreen && css`
                height: ${props.offsets.offsetHeight}px;
                width: ${props.offsets.offsetWidth}px;
                position: absolute;
                top: ${props.offsets.offsetTop}px;
                left: ${props.offsets.offsetLeft}px;
                background-color: #ffffff;
                z-index:10;
            `}
`

const GraphDiv = styled.div`
            height: calc(100% - ${BUTTON_HEIGHT}px);
            width: 100%;
`

const GraphButton = styled.button`
            background-color: ${constants.DEFAULT_BUTTON_COLOR};
            color: white;
            border: none;
            border-radius: 12px;
            height: ${BUTTON_HEIGHT}px;
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
        this.state = {
            isFullScreen: false,
            offsets: null
        };

        this.resizeGraph = this.resizeGraph.bind(this);
        this.saveToFile = this.saveToFile.bind(this);
    }

    componentDidMount() {
        window.addEventListener('resize', () => this.setState({offsets: this.props.fetchOffsets()}));
    }

    resizeGraph() {
        this.setState(prevState => ({
            isFullScreen: !prevState.isFullScreen,
            offsets: this.props.fetchOffsets()
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
            <GraphAreaDiv isFullScreen={this.state.isFullScreen} offsets={this.state.offsets}>
                <GraphButton onClick={this.resizeGraph}>Full screen ON/OF</GraphButton>
                <GraphButton onClick={this.saveToFile}>Save to file</GraphButton>
                <GraphDiv id={this.props.id}></GraphDiv>
            </GraphAreaDiv>
        );
    }
}

exports.Graph = Graph
