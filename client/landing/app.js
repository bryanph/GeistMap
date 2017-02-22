import React, { PropTypes } from 'react'
import ReactDom from 'react-dom'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import "../scss/landing.scss"

const title = "Geist"

const mainSection = {
    header: "Get organized",
    content: "Organize your thoughts and information in a personal knowledge base that adjusts to you",

}
const rows = {
    connections: {
        header: "Relations first",
        content: "Instead of trying to organize all your thoughts and notes in folders, organize your notes by defining relations between them",
        imageSrc: "/static/img/graph1.png",
    },
    explore: {
            header: "Explore your thoughts",
            content: "Easily and quickly explore your thoughts and notes by traversing between them and their collections",
            imageSrc: "/static/img/graph3.png",
    },
    collections: {
            header: "Organize with collections",
            content: "Besides relations, notes can be added to one or more collections to quickly navigate between groups of notes",
            imageSrc: "/static/img/graph2.png",
    },
    // connections: {
    //     header: "More powerful than hierarchies",
    //     content: "Are you tired of hierarchies? So am I. Hierarchies are for dictators.",
    //     imageSrc: "some image",
    // },
    // explore: {
    //         header: "Explore your thoughts",
    //         content: "Instead of just spending your time organizing your thoughts and information, explore and gogogo!",
    //         imageSrc: "some image",
    // },
}
const endSection = {
    header: "Give it a try!"
}

import MainSection from './MainSection'
import EndSection from './EndSection'
import Footer from './Footer'
import FeatureRow from './FeatureRow'
import Navigation from './Navigation'
import FollowOnTwitter from './FollowOnTwitter'

import getMuiTheme from '../app/containers/App/muitheme';

const initialState = window.INITIAL_STATE || {}
const App = (props) => (
    <MuiThemeProvider muiTheme={getMuiTheme()}>
        <div>
            <div className="wrapper">
                <Navigation title={title} />
                <MainSection
                    header={mainSection.header}
                    content={mainSection.content}
                    {...initialState}
                />
                <FeatureRow 
                    header={rows.connections.header}
                    content={rows.connections.content}
                    imageSrc={rows.connections.imageSrc}
                />
                <FeatureRow 
                    header={rows.explore.header}
                    content={rows.explore.content}
                    imageSrc={rows.explore.imageSrc}
                />
                <FeatureRow 
                    header={rows.collections.header}
                    content={rows.collections.content}
                    imageSrc={rows.collections.imageSrc}
                />
                <EndSection {...initialState} header={endSection.header} />
                <Footer />
                <FollowOnTwitter />
            </div>
        </div>
    </MuiThemeProvider>
)

function createElement(Component, props) {
    /*
     * Pass server rendered data as props to all components
    */

    let initialState = window.INITIAL_STATE || {}

    return <Component {...props} {...initialState} />
}

document.addEventListener('DOMContentLoaded', function () {
     ReactDom.render(
         <App />,
         document.getElementById('app')
     );
});
