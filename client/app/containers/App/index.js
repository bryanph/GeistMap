import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { withRouter, Switch, Route, IndexRedirect, Redirect} from "react-router-dom"

import { isLoggedIn } from '../../utils/login.js'

import Topbar from "../../components/Topbar";

import Dialogs from '../../containers/Dialogs'
import Errors from '../../containers/Errors'

// import getMuiTheme from 'material-ui/styles/getMuiTheme';
import getMuiTheme from '../../containers/App/muitheme.js';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import { HotKeys } from 'react-hotkeys'


import Inbox from '../Inbox'
import InboxEditor from '../InboxEditor'
import CollectionOverview from "../CollectionOverview"
import CollectionOverviewEditor from "../CollectionOverviewEditor"
import CollectionDetail from '../CollectionDetail'
import CollectionDetailEditor from '../CollectionDetailEditor'
import NodeExplore from '../NodeExplore'
import NodeExploreEditor from '../NodeExploreEditor'

const keyMapping = {
    'explore': 'ctrl+alt+e',
    'addRelation': 'ctrl+alt+r',
    'duplicate': 'ctrl+alt+d',
    'trash': 'ctrl+alt+g',
    'addCollection': 'ctrl+alt+c',
    'focusSearch': 'ctrl+alt+f',

}

import './styles.css'

class App extends React.Component {
    constructor(props) {
        super(props)

        this.renderError = this.renderError.bind(this)
    }

    componentWillMount() {
        if (window.ga) {
            this.props.history.listen((location) => {
                window.ga('set', 'page', location.pathname + location.search);
                window.ga('send', 'pageview')
            })
        }
    }

    renderError() {
        const { errorMessage } = this.props

        if (!errorMessage) {
            return null
        }

        return (
            <h1>{errorMessage}</h1>
        )
    }

    render() {
        const { match, location, isLoggedIn } = this.props

        return (
            <MuiThemeProvider muiTheme={getMuiTheme()}>
                <HotKeys keyMap={keyMapping} style={{height: '100%'}}>
                    <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
                        <Switch>
                            <Route exact path={"/app/collections/:id/nodes/:nodeId?"} render={() => (
                                <Dialogs 
                                    params={match.params} 
                                    location={location} 
                                />
                            )}/>
                        <Route exact render={() => (
                            <Dialogs 
                                location={location} 
                            />
                        )}/>
                        </Switch>
                        <Errors />
                        <Topbar />

                        { this.renderError() }

                        <Switch>
                            <Route exact path={`${match.path}/inbox/:id?`} component={Inbox}/>
                            <Route path={`${match.path}/inbox/:id/edit`} component={InboxEditor}/>
                            <Route exact path={`${match.path}/nodes/:id?`} component={NodeExplore}/>
                            <Route path={`${match.path}/nodes/:id/edit`} component={NodeExploreEditor}/>
                            <Route exact path={`${match.path}/collections/:id?`} component={CollectionOverview}/>
                            <Route path={`${match.path}/collections/:id/edit`} component={CollectionOverviewEditor}/>

                            <Route exact path={`${match.path}/collections/:id/nodes/:nodeId?`} component={CollectionDetail}/>
                            <Route path={`${match.path}/collections/:id/nodes/:nodeId/edit`} component={CollectionDetailEditor}/>
                            <Redirect from={`${match.path}/`} to={`${match.path}/inbox`}/>
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
        )   
    }
}

function mapStateToProps(state, props) {
    return {
        errorMessage: state.errorMessage,
        isLoggedIn: isLoggedIn(),
    }
}

export default connect(mapStateToProps, {})(withRouter(App))

