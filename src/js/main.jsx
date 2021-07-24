const React = require('react');
const ReactDOM = require('react-dom');

const BrowserRouter = require('react-router-dom').BrowserRouter;
const Switch = require('react-router-dom').Switch;
const Route = require('react-router-dom').Route;
const Link = require('react-router-dom').Link;

const styled = require('styled-components').default;

const Editor = require('./state-machine-editor-component.jsx').Editor;
const Examples = require('./state-machine-examples-component.jsx').Examples;

const List = styled.ul`
    display: flex;
    flex-wrap: nowrap;
    list-style-type: none;
    padding: 0;
    margin: 0 0;
`

const ListItem = styled.li`
    width: 150px;
    height: 25px;
    background-color: #f1f1f1;
    text-align: center;
    vertical-align: middle;
`

const SelectedListItem = styled(ListItem)`
    background-color: #808080;
`

const ListLink = styled(Link)`
    text-align: center;
    text-decoration: none;
    display: block;
    height: 100%;
    width: 100%;
    color: black;
    $:visited, $:hover, $:active {
        color: inherit;
    }
}
`

const Line = styled.div`
    width: 100%;
    height: 2px;
    background-color: #808080;
`

class Tabs extends React.Component {
    render() {
        const tabs = this.props.tabs.map(tab => {
            const TabLink = () => {
                return <ListLink to={tab.path}>{tab.name}</ListLink>
            }
            
            return (<Switch key={tab.name}>
                <Route path={tab.path}>
                    <SelectedListItem><TabLink/></SelectedListItem>
                </Route>
                <Route>
                    <ListItem><TabLink/></ListItem>
                </Route>
            </Switch>);
        });

        const TabContent = () => {
            const tabRouters = this.props.tabs.map(tab => {
                const TabComponent = tab.component
                return (
                    <Route path={tab.path} key={tab.path}>
                        <TabComponent/>
                    </Route>)
            });
            
            const DefaultTabRouter = () => {
                const FirstTabContent = this.props.tabs[0].component;
                return <Route><FirstTabContent/></Route>;
            }

            return (<Switch>
                {tabRouters}
                <DefaultTabRouter/>
            </Switch>);
        }
        
        return (
            <div>
                <List>{tabs}</List>
                <Line/>
                <TabContent/>
            </div>
        );
    }
}


const exampleTabs = [{
        name: "Code area",
        path: "/code-area",
        component: () => {
            return (
                <div>
                    <h1>Please define your state machine here:</h1>
                    <Editor isCodeSavingEnabled={true}/>
                </div>
            );
        }
    },
    {
        name: "Examples",
        path: "/examples",
        component: () => <Examples/>
    },
    {
        name: "Documentation",
        path: "/documentation",
        component: () => <h1>Please find it in <a href="https://github.com/shnax0210/state-machine-analyzer">Git repository</a></h1>
    }]

const ApplicationDiv = styled.div`
            display: flex;
            flex-direction: column;
            width: 95%;
            margin: 0 auto;
`

const IntroductionAreaDiv = styled.div`
    text-align: center;
`

const application = (
    <ApplicationDiv>
        <BrowserRouter>
            <IntroductionAreaDiv>
                <h1>State machine analyzer</h1>
            </IntroductionAreaDiv>
            <Tabs tabs={exampleTabs}/>
        </BrowserRouter>
    </ApplicationDiv>
);

ReactDOM.render(application, document.getElementById('application'));
