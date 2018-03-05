import React from 'react'
import Signup from '../auth/Signup'

export const MainText = (props) => (
    <div className="mainSection-text">
        <h1 className="mainSection-header">{props.header}</h1>
        <p className="mainSection-body">{props.content}</p>
    </div>
)

export const MainSignup = (props) => (
    <div className="mainSection-signup">
        <Signup {...props} />
    </div>
)

export default class MainSection extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="mainSection">
                <MainText header={this.props.header} content={this.props.content} />
                <MainSignup {...this.props}/>
            </div>
        )
    }
}
