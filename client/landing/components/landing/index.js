import React from 'react'
import ReactDom from 'react-dom'

import MainSection from './MainSection'
import EndSection from './EndSection'
import FeatureRow from './FeatureRow'
import CreationLoop from './CreationLoop'

const initialState = window.INITIAL_STATE || {}

class Landing extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { content } = this.props

        return (
            <React.Fragment>
                <header>
                    <section id="intro">
                        <div className="wrapper">
                            <MainSection
                                header={content.mainSection.header}
                                content={content.mainSection.content}
                                {...initialState}
                            />
                        </div>
                    </section>
                </header>

                {
                    /*
                <section className="creationLoopSection">
                    <h2 className="sectionTitle">A vision: The Creation Loop</h2>
                    <CreationLoop />
                </section>
                    */
                }

                <section className="whereWeAreSection">
                    <h2 className="sectionTitle">Where we are now</h2>
                    <FeatureRow 
                        header={content.rows.connections.header}
                        content={content.rows.connections.content}
                        imageSrc={content.rows.connections.imageSrc}
                    />
                    <FeatureRow 
                        header={content.rows.explore.header}
                        content={content.rows.explore.content}
                        imageSrc={content.rows.explore.imageSrc}
                    />
                    <FeatureRow 
                        header={content.rows.editor.header}
                        content={content.rows.editor.content}
                        imageSrc={content.rows.editor.imageSrc}
                    />
                </section>

                <section className="whereWeGoSection">
                    <h2 className="sectionTitle">Where we are going</h2>
                </section>

                <section className="futureSection">
                    <h2 className="sectionTitle">Help us get there</h2>
                    <div className="futureSection-contribute">
                    </div>
                    <div className="futureSection-donate">
                    </div>
                </section>

                <EndSection {...initialState} header={content.endSection.header} />
            </React.Fragment>
        )
    }
}

export default Landing
