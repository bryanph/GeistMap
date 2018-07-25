import React from 'react'
import { Link } from 'react-router-dom'

import { FlatButton } from '../../app/components/button'

export const Title = (props) => (
    <span className="navigation-title">GeistMap</span>
)



const NavigationLink = (props) => (
    <FlatButton as={Link} {...props} className="navigation-link"/>
)
const NavigationHref = (props) => (
    <FlatButton as="a" {...props} className="navigation-link"/>
)

export const RightNav = (props) => (
    <div className="right-nav">
        <div className="icons">
            <NavigationHref 
                href="https://twitter.com/bphaakman"
                iconName="twitter"
                target="_blank"
            />
            <NavigationHref 
                href="https://github.com/bryanph/GeistMap"
                iconName="github"
                target="_blank"
            />
        </div>
        <NavigationHref href="mailto:bryanhaakman@gmail.com">Contact</NavigationHref>
        <NavigationHref href="/auth/login">Log in</NavigationHref>
        <NavigationHref href="/auth/signup">Sign up</NavigationHref>
    </div>
)

export const LeftNav = (props) => (
        <div className="left-nav">
            {
                /*
                <NavigationLink to="/features">Features</NavigationLink>
                <NavigationLink to="/vision">Future vision</NavigationLink>
                <NavigationHref href="/blog">Blog</NavigationHref>
                <NavigationHref href="mailto:support@geistmap.com">Contact</NavigationHref>
                */

            }
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
                <LeftNav />
                <RightNav />
            </div>
        )
    }
}
