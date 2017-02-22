
import React, { PropTypes } from 'react'
import Signup from '../auth/Signup'

export default class EndSection extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="endSection">
                <h2 className="endSection-header">{this.props.header}</h2>
                <Signup {...this.props} />
            </div>
        )
    }
}
