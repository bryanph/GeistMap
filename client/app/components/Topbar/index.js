"use strict"

import _ from 'lodash'
import React from 'react'
import { PropTypes } from 'react'
import { connect } from 'react-redux'
import store from '../../app'
import classNames from 'classnames'
import { withRouter } from 'react-router'

import { Notification } from '../general/Notification.react.jsx'

import {
    Toolbar,
    ToolbarGroup,
    ToolbarTitle
} from 'material-ui'

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton/IconButton';
import FontIcon from 'material-ui/FontIcon';
import NotificationsIcon from 'material-ui/svg-icons/social/notifications';
import PersonIcon from 'material-ui/svg-icons/social/person';
import ActionMenu from 'material-ui/svg-icons/navigation/menu';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';


import {
    Avatar,
    Badge,
} from 'material-ui'

import NodeCreateButton from '../../containers/NodeCreateButton'
import Sidebar from '../../containers/Sidebar'
import AllSearch from '../../containers/AllSearch'

import './styles.css'

import { primaryColor, accentColor } from '../../containers/App/muitheme.js'

const styles = {
    topbar: {
        backgroundColor: primaryColor,
        color: '#fff'
    },
    menuButtonContainer: {
        backgroundColor: accentColor,
    },
    menuButton: {
        color: '#fff',
        width: 72,
        height: 72,
        // padding: 16,
    },
    menuIcon: {
        width: 36,
        height: 36,
    },
    logo: {
        marginLeft: '10px',
    },
}


export const Logo = ({pageTitle, ...props}) => {
    // const title = pageTitle ? `ThinkTool - ${pageTitle}` : 'ThinkTool'
    // const title = ''
    const title = pageTitle || ''
    return <ToolbarTitle text={title} {...props} /> 
}
Logo.propTypes = {
    
}


export const NotificationCenter = React.createClass({

    propTypes: {
        
    },

    render: function() {
        
        return (
            <Badge
                badgeContent={0}
                primary={true}
            >
                <NotificationsIcon />
            </Badge>
        )
    }
})

export const ProfileButton = React.createClass({

    propTypes: {
        
    },

    render: function() {
        const { user } = this.props
        const firstLetter = 
            (user.firstName && user.firstName.charAt(0).toUpperCase()) || 
            (user.lastName && user.lastName.charAt(0).toUpperCase()) ||
            (user.username && user.username.charAt(0).toUpperCase())

        return (
            // TODO: first letter of name of user - 2016-07-28
            <IconMenu
                style={{ cursor: 'pointer' }}
                iconButtonElement={<Avatar backgroundColor={accentColor}>{firstLetter}</Avatar>}
                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
            >
                <a href="/auth/logout" style={{textDecoration: 'none'}}>
                    <MenuItem primaryText="Logout" />
                </a>
            </IconMenu>
        )
    }
})

class ExtraButton extends React.Component {
    constructor(props) {
        super(props)

        this.showShortcutWindow = this.showShortcutWindow.bind(this)
    }

    showShortcutWindow() {
        this.props.updateUi({
            shortcutWindow: true
        })
    }

    render() {
        const { updateUi } = this.props

        return (
            <IconMenu
                iconButtonElement={
                    <IconButton><MoreVertIcon color='white' /></IconButton>
                    }
                    targetOrigin={{horizontal: 'right', vertical: 'top'}}
                    anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                >
                    <MenuItem onTouchTap={this.showShortcutWindow} primaryText="Show keyboard shortcuts" />
                </IconMenu>       
        )
    }
}

class Topbar extends React.Component {
    constructor(props) {
        super(props)

        this.navigate = this.navigate.bind(this)
    }

    navigate(result) {
        const id  = result._id
        if(result._index === "collections2") { // TODO: do this differently - 2017-05-10
            this.props.router.push(`/app/collections/${id}`)
        } 
        else if (result._index === 'nodes2') { // TODO: do this differently - 2017-05-10
            this.props.router.push(`/app/nodes/${id}/edit`)
        }
    }

    render() {
        return ( 
            <div className="topbar">
                <Sidebar 
                    open={this.props.navOpened}
                    toggleNav={this.props.toggleNav}
                    router={this.props.router}
                    createNode={this.props.createNode}
                    createBatchNode={this.props.createBatchNode}
                    showCreateCollectionWindow={this.props.showCreateCollectionWindow}
                    hideGraphSideBar={this.props.hideGraphSideBar}
                />
                <Toolbar style={styles.topbar}>
                    <ToolbarGroup firstChild={true}>
                        <div className="topbar-menu" style={styles.menuButtonContainer}>
                            <IconButton 
                                tooltip="Menu" 
                                style={styles.menuButton} 
                                iconStyle={styles.menuIcon}
                                onTouchTap={() => this.props.toggleNav()}
                            >
                                <ActionMenu color={'#fff'} />
                            </IconButton>
                        </div>
                        <Logo style={styles.logo} pageTitle={this.props.title} className={'topbar-logo'}/>
                    </ToolbarGroup>
                    <ToolbarGroup firstChild={true} style={{width: '25rem'}}>
                        <AllSearch 
                            onSearchClick={this.navigate} 
                        />
                    </ToolbarGroup>
                    <ToolbarGroup>
                        <div className="topbar-create">
                            <ExtraButton
                                updateUi={this.props.updateUi}
                            />
                            <NodeCreateButton 
                                style={{marginRight: '1rem'}}
                            />
                            <ProfileButton 
                                user={this.props.user}
                            />
                            <FontIcon className="muidocs-icon-custom-sort" />
                        </div>
                    </ToolbarGroup>
                </Toolbar>
            </div>
        )

    }
}
Topbar.propTypes = {
    
}

import { createNode, createBatchNode, updateUi } from '../../actions/async'
import { toggleNav, showCreateCollectionWindow, hideGraphSideBar } from '../../actions/ui'

function mapStateToProps(state, props) {
    return {
        navOpened: state.uiState.navOpened,
        title: state.uiState.title,
        user: state.user,
    }
}

export default connect(mapStateToProps, { toggleNav, createNode, createBatchNode, showCreateCollectionWindow, hideGraphSideBar, updateUi })(withRouter(Topbar));
