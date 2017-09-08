/*
 *
 * Sidebar
 *
 */

import React from 'react';
import { connect } from 'react-redux';

import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ActionGroupWork from 'material-ui/svg-icons/action/group-work';

import { Link } from 'react-router-dom'

import { primaryColor, lightTextColor } from '../App/muitheme.js'

const styles = {
    drawer: {
        backgroundColor: primaryColor,
        color: lightTextColor
    },
    link: {
        textDecoration: 'none',
    },
    menuItem: {
        fontWeight: 'bold',
        color: lightTextColor
    }
}

const defaultNode = {
    name: 'Untitled',
    content: '',
}

class Sidebar extends React.Component {
    constructor(props) {
        super(props)

        this.toggleNav = this.toggleNav.bind(this)
        this.createNode = this.createNode.bind(this)
        this.createCollection = this.createCollection.bind(this)

    }

    toggleNav() {
        this.props.toggleNav()
    }

    createNode() {
        this.props.createNode(defaultNode)
            .then(action => action.response.result)
            .then(id => this.props.history.push(`/app/inbox/${id}/edit`))

        this.props.toggleNav()
    }

    createCollection() {
        this.props.showCreateCollectionWindow()
        this.props.toggleNav()
    }

    render() {
        const { toggleNav } = this.props
        return (
            <Drawer 
                open={this.props.open} 
                docked={false}
                onRequestChange={this.toggleNav}
                containerStyle={styles.drawer}
            >
                <Link style={styles.link} to="/app/inbox"><MenuItem style={styles.menuItem} onClick={this.toggleNav}>Inbox</MenuItem></Link>
                <Link style={styles.link} to="/app/nodes"><MenuItem style={styles.menuItem} onClick={this.toggleNav}>Nodes</MenuItem></Link>
                <Link style={styles.link} to="/app/collections"><MenuItem style={styles.menuItem} onClick={this.toggleNav}>Collections</MenuItem></Link>
                <MenuItem style={styles.menuItem} onClick={this.createNode} leftIcon={<ContentAdd color='white' />}>Create Node</MenuItem>
                <MenuItem style={styles.menuItem} onClick={this.createCollection} leftIcon={<ActionGroupWork color='white' />}>Create Collection</MenuItem>
                { /* <Link style={styles.link} to="/app/explore/collections"><MenuItem style={styles.menuItem} onClick={this.toggleNav}>Explore collections</MenuItem></Link> */ }
            </Drawer>
            
        )
    }
}

export default Sidebar
