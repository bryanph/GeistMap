import React, { PropTypes } from 'react'

export default class Footer extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="footer">
                <a href="mailto:bryanhaakman@gmail.com">Contact</a>
                <span>© 2016 Bryan Haakman</span>
            </div>
        )
    }
}
