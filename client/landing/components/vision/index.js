
import React from 'react'
import ReactDom from 'react-dom'
import CreationLoop from '../home/CreationLoop'

class Landing extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { content } = this.props

        return (
            <React.Fragment>
                <section className="creationLoopSection">
                    <h2 className="sectionTitle">A vision: The Creation Loop</h2>
                    <CreationLoop />
                </section>
            </React.Fragment>
        )
    }
}

export default Landing
