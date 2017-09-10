/*
 *
 * ArchiveSidebar
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
import moment from 'moment'

import Spinner from '../../components/Spinner'

import classNames from 'classnames'
import './styles.scss'

import NodeContentEditor from '../NodeContentEditor'

class ArchiveSidebar extends React.Component { // eslint-disable-line react/prefer-stateless-function

    constructor(props) {
        super(props)

        this.editNode = this.editNode.bind(this)
        this.deleteNode = this.deleteNode.bind(this)

        this.state = {
            fetched: false
        }
    }

    componentWillReceiveProps(nextProps) {
        // delay fetch until user opens the sidebar
        if (!this.state.fetched && nextProps.archiveSidebarOpened) {
            nextProps.loadArchive()
            this.setState({ fetched: true })
        }
    }

    editNode(id) {
        const { history } = this.props
        history.push(`/app/nodes/${id}/edit`)
        this.props.hideArchiveSidebar()
    }

    deleteNode(id) {
        const result = window.confirm(`Are you sure you want to remove this node?`)
        if (result) {
            this.props.removeNode(id)
        }
    }



    render() {
        const { nodes, archiveSidebarOpened, loadingStates } = this.props

        if (loadingStates.GET_ARCHIVE) {
            return <Spinner />
        }

        const items = nodes.map(node => (
            <ArchiveItem
                key={node.id}
                node={node}
                deleteNode={this.deleteNode}
                editNode={this.editNode}
            />
        ))

        const classes = classNames("archiveSidebar", {
            "archiveSidebar-opened": archiveSidebarOpened
        })


        return (
            <div className={ classes }>
                { items }
            </div>
        );
    }
}


import { FlatButton } from '../../components/button'
// only rendered on mobile
const DeleteButton = (props) => (
    <FlatButton iconName="trash" className="archiveSidebar-delete" {...props} />
)
const EditButton = (props) => (
    <FlatButton iconName="write" {...props} />
)


class ArchiveItem extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { node, deleteNode, editNode } = this.props

        return (
            <div className="archiveSidebar-item">
                <div className="archiveSidebar-header">
                    <h2>{ node.name }</h2>
                    <span>
                        { moment.unix(node.modified / 1000).fromNow() }
                    </span>
                </div>

                <div className="archiveSidebar-content">
                    <NodeContentEditor
                        id={node.id}
                        withToolbar={false}
                        readOnly={true}
                    />
                </div>

                <div className="archiveSidebar-actions">
                    <EditButton onClick={() => editNode(node.id)} />
                    <DeleteButton onClick={() => deleteNode(node.id)}/>
                </div>

                <div className="archiveSidebar-expand">
                </div>

                <div className="archiveSidebar-fadeout"></div>
            </div>
        )
    }
}

import { 
    getNode,
    getEdgesForNodes,
    getArchiveNodes,
} from '../../reducers'



function mapStateToProps(state, props) {
    // TODO: rename to Archive and handle fetching - 2017-08-25
    return {
        nodes: getArchiveNodes(state),
        loadingStates: state.loadingStates,
        archiveSidebarOpened: state.uiState.archiveSidebar.opened
    }
}

import {
    removeNode,
    loadArchive,
} from '../../actions/node'

import {
    hideArchiveSidebar,
} from '../../actions/ui'

export default connect(mapStateToProps, {
    hideArchiveSidebar,
    removeNode,
    loadArchive,
})(withRouter(ArchiveSidebar));
