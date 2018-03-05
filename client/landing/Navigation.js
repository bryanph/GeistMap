import React from 'react'

import FlatButton from 'material-ui/FlatButton';
import { Icon } from 'semantic-ui-react'

export const Title = (props) => (
    <span className="navigation-title">{props.title}</span>
)

export const Actions = (props) => (
    <div className="navigation-actions">
        <div className="navigation-actions-icons">
            <a href="https://twitter.com/bphaakman" target="_blank">
                <Icon link name="twitter" size="large" inverted={true} />
            </a>
            <a href="https://github.com/bryanph/GeistMap" target="_blank">
                <Icon link name="github" size="large" inverted={true} />
            </a>
        </div>
        <FlatButton label="Contact" primary={true} href="mailto:bryanhaakman@gmail.com" 
            labelStyle={{fontSize: '1.2rem'}}
        />
        <FlatButton label="Login" primary={true} href="/auth/login" 
            labelStyle={{fontSize: '1.2rem'}}
        />
    </div>
)

export default class Navigation extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="navigation">
                <Title title={this.props.title}/>
                <Actions />
            </div>
        )
    }
}
