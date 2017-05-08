import React, { PropTypes } from 'react'
import FlatButton from 'material-ui/FlatButton';

export const Title = (props) => (
    <div className="navigation-title">
        <span>{props.title}</span>
    </div>
)

export const Actions = (props) => (
    <div className="navigation-actions">
        <FlatButton label="Contact me" primary={true} href="mailto:bryanhaakman@gmail.com" 
            labelStyle={{fontSize: '1rem'}}
        />
        <FlatButton label="Twitter" primary={true} href="https://twitter.com/bphaakman" 
            labelStyle={{fontSize: '1rem'}}
        />
        <FlatButton label="Login" primary={true} href="/auth/login" 
            labelStyle={{fontSize: '1rem'}}
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
Navigation.propTypes = {
    
}
