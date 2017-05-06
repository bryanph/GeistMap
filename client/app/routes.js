import React from 'react'
import { Route, Link, IndexRoute, IndexRedirect, Redirect, BrowserHistory } from "react-router"

import App from './containers/App'
import Inbox from './containers/Inbox'
import InboxEditor from './containers/InboxEditor'
import CollectionOverview from "./containers/CollectionOverview"
import CollectionOverviewEditor from "./containers/CollectionOverviewEditor"
import CollectionDetail from './containers/CollectionDetail'
import CollectionDetailEditor from './containers/CollectionDetailEditor'
import NodeExplore from './containers/NodeExplore'
import NodeExploreEditor from './containers/NodeExploreEditor'

import io from 'socket.io-client'
import { wrapPromise } from './utils/promise.js'
import { isLoggedIn } from './utils/login.js'

function requireAuth(nextState, replace) {
    // if (!isLoggedIn()) {
    if (!true) {
        window.location = "/"
    } else {
        // initialize socket
        // let socket = io('/');
    }
}



export default (
    <Route path="/app" component={App}>
        <Route onEnter={requireAuth}>
            <IndexRedirect to="/app/inbox" />
            <Redirect from="/app/batch" to="/app/inbox" />
            <Route path="inbox" component={Inbox}/>
            <Route path="inbox/:id" component={Inbox}/>
            <Route path="inbox/:id/edit" component={InboxEditor}/>
            <Route path="nodes" component={NodeExplore}/>
            <Route path="nodes/:id" component={NodeExplore}/>
            <Route path="nodes/:id/edit" component={NodeExploreEditor}/>
            {
                /*
            <Route path="explore" component={NodeExplore}/>
            <Route path="explore/nodes" component={NodeExplore}/>
            <Route path="explore/nodes/:id" component={NodeExploreEditor}/>
                */
            }

            <Route path="collections" component={CollectionOverview}/>
            <Route path="collections/:id" component={CollectionOverview}/>
            <Route path="collections/:id/edit" component={CollectionOverviewEditor}/>

            <Route path="collections/:id/nodes" component={CollectionDetail}/>
            <Route path="collections/:id/nodes/:nodeId" component={CollectionDetail}/>
            <Route path="collections/:id/nodes/:nodeId/edit" component={CollectionDetailEditor}/>

            {
                /*
            <Route path="explore/collections" component={CollectionExplore}/>
            <Route path="explore/collections/:id" component={CollectionExplore}/>
                */
            }
        </Route>
    </Route>
)
