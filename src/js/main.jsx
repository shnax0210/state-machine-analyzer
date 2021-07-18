const React = require('react');
const ReactDOM = require('react-dom');
const styled = require('styled-components').default;

const Editor = require('./state-machine-editor-component.jsx').Editor;
const Examples = require('./state-machine-examples-component.jsx').Examples;

const List = styled.ul`
    display: flex;
    flex-wrap: nowrap;
    list-style-type: none;
    padding: 0;
`

const ListItem = styled.li`
    width: 100%;
    height: 30px;
    background-color: #f1f1f1;
    border-radius: 12px;
    text-align: center;
    vertical-align: middle;
`

const SelectedListItem = styled(ListItem)`
    background-color: #808080;
`

const ListLink = styled.a`
    padding: 14px 16px;
    text-align: center;
`

class Tabs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {selectedTab: this.props.tabs[0]};
    }

    selectTab(tab) {
        this.setState({selectedTab: tab});
    }

    render() {
        const selectedTab = this.state.selectedTab;
        const SelectedTabComponent = this.state.selectedTab.component;

        const list = this.props.tabs.map(tab => {
            const ListItemElement = tab.name === selectedTab.name ? SelectedListItem : ListItem;
            return (
                <ListItemElement onClick={() => this.selectTab(tab)} key={tab.name}>
                    <ListLink>{tab.name}</ListLink>
                </ListItemElement>)
        });

        return (
            <div>
                <List>{list}</List>
                <SelectedTabComponent isCodeSavingEnabled={true}/>
            </div>
        );
    }
}


const exampleTabs = [{
        name: "Code area",
        component: () => <Editor isCodeSavingEnabled={true}/>
    },
    {
        name: "Examples",
        component: () => <Examples/>
    },
    {
        name: "Documentation",
        component: () => <h1>Hello</h1>
    }]

const ApplicationDiv = styled.div`
            display: flex;
            flex-direction: column;
            width: 95%;
            margin: 0 auto;
`

const IntroductionAre = styled.div`
    text-align: center;
`

const application = (
    <ApplicationDiv>
        <IntroductionAre>
            <h1>State machine analyzer</h1>
        </IntroductionAre>
        <Tabs tabs={exampleTabs}/>
    </ApplicationDiv>
);

ReactDOM.render(
    application,
    document.getElementById('application')
);
