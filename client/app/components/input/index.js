import React from 'react'
import classNames from 'classnames'
import withProps from 'recompose/withProps'

import './styles.scss'


export class InputText extends React.Component {

    static defaultProps = {
        type: "text",
    };

    constructor(props) {
        super(props)
    }

    render() {
        const className = classNames("defaultInput", this.props.className)

        return (
            <input {...this.props} className={className} />
        )
    }
}


export class InputEmail extends React.Component {

    static defaultProps = {
        type: "email",
    };

    constructor(props) {
        super(props)
    }

    render() {
        const className = classNames("defaultInput", this.props.className)

        return (
            <input {...this.props} className={className} />
        )
    }
}


export class InputPassword extends React.Component {

    static defaultProps = {
        type: "password",
    };

    constructor(props) {
        super(props)
    }

    render() {
        const className = classNames("defaultInput", this.props.className)

        return (
            <input {...this.props} className={className} />
        )
    }
}

export class ValidateInput extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { error, children } = this.props

        return (
            <div className="validateInput">
                { children }
                { error ? <span><i className="fa fa-exclamation-circle" />{error}</span> : null }
            </div>
            
        )
    }
}
