import React from 'react'

import { FlatLink } from '../app/components/button'

export const Title = (props) => (
    <span className="navigation-title">{props.title}</span>
)

const NavigationLink = (props) => (
    <FlatLink {...props} className="navigation-link"/>
)

export const Actions = (props) => (
    <div className="navigation-actions">
        <div className="navigation-actions-icons">
            <NavigationLink 
                href="https://twitter.com/bphaakman"
                iconName="twitter"
                target="_blank"
            />
            <NavigationLink 
                href="https://github.com/bryanph/GeistMap"
                iconName="github"
                target="_blank"
            />
        </div>
        <NavigationLink href="mailto:bryanhaakman@gmail.com">Contact</NavigationLink>
        <NavigationLink href="/auth/login">Login</NavigationLink>
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
