import React from 'react'
import { BrowserRouter, Route, IndexRedirect, Redirect} from "react-router-dom"

import App from './containers/App'

export default () => (
    <BrowserRouter>
        <Route path="/app" component={App} />
    </BrowserRouter>
)
