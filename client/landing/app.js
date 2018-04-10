import React from 'react'
import ReactDom from 'react-dom'

import 'font-awesome/css/font-awesome.min.css'
import "../scss/landing.scss"

import Navigation from './components/Navigation'
import Footer from './components/Footer'

import Landing from './components/landing'
import Vision from './components/vision'
import Donate from './components/donate'

import { BrowserRouter, Switch, Route } from "react-router-dom"

const content = require('./content.json')

const initialState = window.INITIAL_STATE || {}

const App = (props) => (
    <div>
        <header className="globalNav">
            <div className="wrapper">
                <Navigation />
            </div>
        </header>

        <main>
            <Switch>
                <Route exact path="/" render={() => <Landing content={content} />} />
                <Route exact path="/vision" component={Vision} />
                <Route exact path="/donate" component={Donate} />
            </Switch>
        </main>

        <Footer { ...initialState } />
    </div>
)

document.addEventListener('DOMContentLoaded', function () {
    ReactDom.render(
        <BrowserRouter>
            <App {...initialState} />
        </BrowserRouter>,
        document.getElementById('root')
    );
});
