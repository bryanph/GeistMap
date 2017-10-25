import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter, Switch, Route, IndexRedirect, Redirect} from "react-router-dom"

import { isLoggedIn } from '../../utils/login.js'

import Topbar from "../../components/Topbar";

import Errors from '../../containers/Errors'

// import getMuiTheme from 'material-ui/styles/getMuiTheme';
import getMuiTheme from '../../containers/App/muitheme.js';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import { HotKeys } from 'react-hotkeys'


import CollectionOverview from "../CollectionOverview"
import NodeView from '../NodeView'
import CollectionDetailEditor from '../CollectionDetailEditor'
import NodeExploreEditor from '../NodeExploreEditor'
import ArchiveSidebar from '../ArchiveSidebar'

import EditCollectionOverlay from '../EditCollectionOverlay'
import ErrorBoundary from '../ErrorPage'

const keyMapping = {
    'escape': 'esc',
    'explore': 'ctrl+alt+e',
    'addRelation': 'ctrl+alt+r',
    'duplicate': 'ctrl+alt+d',
    'trash': 'ctrl+alt+g',
    'addCollection': 'ctrl+alt+c',
    'focusSearch': 'ctrl+alt+f',
    "navigateMode": "n",
    "editMode": "e",
    "abstractMode": "a",
    "focusMode": "f",
    "deleteMode": "d"
}

class App extends React.Component {

    constructor(props) {
        super(props)
    }

    componentWillMount() {
        if (window.ga) {
            this.props.history.listen((location) => {
                window.ga('set', 'page', location.pathname + location.search);
                window.ga('send', 'pageview')
            })
        }
    }

    render() {
        const { match, location, isLoggedIn, rootCollectionId } = this.props

        return (
            <ErrorBoundary>
                <MuiThemeProvider muiTheme={getMuiTheme()}>
                    <HotKeys keyMap={keyMapping} style={{height: '100%'}}>
                        <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
                            <EditCollectionOverlay />
                            <Errors />
                            <Topbar />

                            <ArchiveSidebar />

                            <Switch>
                                { /* same component to allow for smooth transitions */ }
                                <Route exact path={'/app/nodes/:nodeId?'} render={(props) => <NodeView {...props} graphType="node" />}/>
                                <Route exact path={'/app/collections/:collectionId?/nodes/:nodeId?'} render={(props) => {
                                    const collectionId = props.match.params.collectionId

                                    if (!collectionId) {
                                        return <Redirect to={`/app/collections/${rootCollectionId}/nodes`}/>
                                    }

                                    return (
                                        <NodeView {...props} graphType="collection" />
                                    )
                                }} />


                                <Route exact path={'/app/nodes/:nodeId/edit'} component={NodeExploreEditor}/>
                                <Route exact path={'/app/collections/:collectionId/nodes/:nodeId/edit'} component={CollectionDetailEditor}/>

                                { /* The overview graph showing explicit collection links */ }
                                <Route exact path={'/app/collections/:collectionId'} component={CollectionOverview}/>

                                <Redirect from={'/app/'} to={'/app/collections/nodes'}/>
                            </Switch>
                            {
                                /*
                    <Route path="explore/collections" component={CollectionExplore}/>
                    <Route path="explore/collections/:id" component={CollectionExplore}/>
                    */
                            }
                        </div>
                    </HotKeys>
                </MuiThemeProvider>
            </ErrorBoundary>
        )
    }
}

function mapStateToProps(state, props) {
    return {
        isLoggedIn: isLoggedIn(),
        rootCollectionId: state.user.rootCollectionId,
    }
}

export default connect(mapStateToProps, {})(withRouter(App))
