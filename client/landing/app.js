import React from 'react'
import ReactDom from 'react-dom'

import 'semantic-ui-css/semantic.min.css';
import "../scss/landing.scss"

// TODO: set from within settings - 2017-07-04
const title = "GeistMap"

const mainSection = {
    header: "Organize your thoughts",
    content: "GeistMap is a knowledge management tool that works the way your brain does. It uses a combination of structure and assocation to allow you to make sense of this increasingly complex world.",

}
const rows = {
    connections: {
        header: "A focus on association",
        content: "",
        content: "Instead of trying to organize all your thoughts and notes in hierarchical folders, organize your notes by defining relations between them. This is ideal for studying or research.",
        imageSrc: "https://cdn-images-1.medium.com/max/800/1*d6Vw7Bc6-f6eoXli9qPVUQ.png",
    },
    explore: {
        header: "Define hierarchies whenever you need them.",
        content: "Instead of being limited by a folder structure, GeistMap allows you to create hierarchies from every node.",
        imageSrc: "https://cdn-images-1.medium.com/max/800/1*XuRGyMSHCy98bTx2aQwwLQ.png",
    },
    editor: {
        header: "A powerful editor",
        content: "Every node has a document attached to it. Add pictures, video, audio and even TeX. Links made in the editor are reflected in the network.",
        imageSrc: "https://cdn-images-1.medium.com/max/800/1*ZZ_4dgoPyfF2rvlHiABAKg.gif",
    },
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
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

const initialState = window.INITIAL_STATE || {}
const App = (props) => (
    <MuiThemeProvider muiTheme={getMuiTheme()}>
        <header className="globalNav">
            <div className="wrapper">
                <Navigation title={title} />
            </div>
        </header>

        <main>
            <header>
                <section id="intro">
                    <div className="wrapper">
                        <MainSection
                            header={mainSection.header}
                            content={mainSection.content}
                            {...initialState}
                        />
                    </div>
                </section>
            </header>

            <section className="whereWeAreSection">
                <h2 className="sectionTitle">Where we are now</h2>
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
                    header={rows.editor.header}
                    content={rows.editor.content}
                    imageSrc={rows.editor.imageSrc}
                />
            </section>

            <section className="whereWeGoSection">
                <h2 className="sectionTitle">Where we are going</h2>
            </section>

            <section className="whereWeGoSection">
                <h2 className="sectionTitle">Help us get there</h2>
            </section>

            <EndSection {...initialState} header={endSection.header} />
        </main>

        <Footer { ...initialState } />

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
        document.getElementById('root')
    );
});
