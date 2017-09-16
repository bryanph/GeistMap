"use strict"

import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { Link, withRouter } from 'react-router-dom'

import Sidebar from '../../containers/Sidebar'
import AllSearch from '../../containers/AllSearch'

import './styles.scss'

export const Logo = (props) => (
    <Link to="/app" className="topbar-logo">
        <span className="topbar-logo">Geist</span>
    </Link>
)


import { Button, Icon } from 'semantic-ui-react'
const ArchiveButton = (props) => (
    <button className="topbar-archiveButton" {...props}>
        <Icon name="archive" size="large" /> <span>Archive</span>
    </button>
)

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
        <Dropdown icon='user' pointing="top right" floating button className='topbar-action icon circular large'>
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
        return this.props.createNode({ name: 'Untitled', content: '' })
            .then(action => action.response.result)
            .then(id => this.props.history.push(`/app/nodes/${id}/edit`))
    }


    render() {
        const { archiveSidebarOpened, showArchiveSidebar, hideArchiveSidebar } = this.props

        return (
            <div className="topbar">
                <div className="topbar-left">
                    <div className="topbar-archive">
                        {
                            /*
                        <ArchiveButton onClick={() => 
                                !archiveSidebarOpened ? showArchiveSidebar() : hideArchiveSidebar()
                        }
                            />
                            */
                        }
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

import { createNode } from '../../actions/node'
import { showArchiveSidebar, hideArchiveSidebar } from '../../actions/ui'

function mapStateToProps(state, props) {
    return {
        user: state.user,
        archiveSidebarOpened: state.uiState.archiveSidebar.opened
    }
}

export default connect(mapStateToProps, {
    createNode,
    showArchiveSidebar,
    hideArchiveSidebar,
})(withRouter(Topbar));
