import React from 'react'
import Signup from '../../../auth/Signup'

export default class EndSection extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="endSection">
                <span className="endSection-header">{this.props.header}</span>
                <Signup {...this.props} />
            </div>
        )
    }
}
