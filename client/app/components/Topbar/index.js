"use strict"

import _ from 'lodash'
import React from 'react'
import { PropTypes } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { Link, withRouter } from 'react-router-dom'

import {
    Toolbar,
    ToolbarGroup,
    ToolbarTitle,
    Avatar
} from 'material-ui'

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton/IconButton';
import FontIcon from 'material-ui/FontIcon';
import PersonIcon from 'material-ui/svg-icons/social/person';
import ActionMenu from 'material-ui/svg-icons/navigation/menu';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

import Sidebar from '../../containers/Sidebar'
import AllSearch from '../../containers/AllSearch'

import './styles.scss'

import { primaryColor, accentColor } from '../../containers/App/muitheme.js'


export const Logo = (props) => (
    <Link to="/app" className="topbar-logo">
        <span className="topbar-logo">Geist</span>
    </Link>
)


import { Button, Icon } from 'semantic-ui-react'
const InboxButton = (props) => (
    <button className="topbar-inboxButton" {...props}>
        <Icon name="inbox" size="large" /> <span>Inbox</span>
    </button>
)

// import FloatingActionButton from 'material-ui/FloatingActionButton'
// import ContentAdd from 'material-ui/svg-icons/content/add';
// const AddButton = (props) => (
//     <FloatingActionButton onTouchTap={props.onClick} mini={true}>
//         <ContentAdd />
//     </FloatingActionButton>
// )
// AddButton.propTypes = {
//     onClick: PropTypes.func.isRequired,
// }

const AddButton = (props) => (
    <Button circular icon="plus" size="large" className="topbar-action" {...props} />
)

import { Dropdown, Input } from 'semantic-ui-react'
const ProfileButton = ({ user }) => {
    const firstLetter = 
        (user.firstName && user.firstName.charAt(0).toUpperCase()) || 
        (user.lastName && user.lastName.charAt(0).toUpperCase()) ||
        (user.username && user.username.charAt(0).toUpperCase())

    return (
        <Dropdown icon='filter' pointing="top right" floating button className='topbar-action icon circular large'>
            <Dropdown.Menu>
                <Dropdown.Item as={'a'} href="/auth/logout" icon="log out" text='Logout' />
            </Dropdown.Menu>
        </Dropdown>
    )
}


class Topbar extends React.Component {
    constructor(props) {
        super(props)

        this.navigate = this.navigate.bind(this)
        this.createNode = this.createNode.bind(this)
    }

    navigate(result) {
        const id  = result._id

        if(result._index.startsWith("collections")) {
            this.props.history.push(`/app/collections/${id}`)
        } 
        else if (result._index.startsWith('nodes')) {
            this.props.history.push(`/app/nodes/${id}/edit`)
        }
    }

    createNode() {
        return this.props.createBatchNode({ name: 'Untitled', content: '' })
            .then(action => action.response.result)
            .then(id => this.props.history.push(`/app/inbox/${id}`))
    }


    render() {
        const { showInboxSidebar } = this.props

        return (
            <div className="topbar">
                <div className="topbar-left">
                    <div className="topbar-inbox">
                        <InboxButton onClick={() => showInboxSidebar()} />
                    </div>
                    <div className="topbar-search">
                        <AllSearch 
                            onSearchClick={this.navigate}
                        />
                    </div>
                </div>

                <Logo />

                <div className="topbar-actions">
                    <AddButton onClick={this.createNode}/>
                    <ProfileButton user={this.props.user} />

                </div>
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
