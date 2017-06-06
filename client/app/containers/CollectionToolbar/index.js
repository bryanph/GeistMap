/*
 *
 * NodeToolbar
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom'
import {HotKeys} from 'react-hotkeys';
import moment from 'moment'

import SavedState from '../../containers/SavedState'
import Spinner, { InlineSpinner } from '../../components/Spinner'

import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import EditableTitle from '../../components/EditableTitle'

import { GraphButton, CreateCollectionButton, AddButton, EditButton, CollectionButton, AddRelationButton } from '../../components/Buttons'
import { TrashButton} from '../../components/Buttons'

import { accentColor } from '../../containers/App/muitheme'

import { NodeTitle, NodeSubtitle } from '../../components/NodeToolbar'

export const CollectionDetailButton = (props) => (
    <Link to={`/app/collections/${props.id}/nodes`}>
        <CollectionButton label="Show Nodes" secondary={true} primary={false} />
    </Link>
)

const styles = {
    cardTitle: {
        textAlign: 'center',
    },
    cardActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        maxWidth: '1000px',
        marginTop: '10px',
        marginRight: '10px',
    },
    collapseButton: {
        zIndex: 99,
        position: 'absolute',
        right: 0,
        top: 0,
    },
    leftBottom: {
        display: 'inline',
        position: 'absolute',
        bottom: '0px',
        left: '30px',
    },
}

export class CollectionToolbar extends React.Component { // eslint-disable-line react/prefer-stateless-function
    constructor(props) {
        super(props)

        this.editCollection = this.editCollection.bind(this)
        this.toGraphView = this.toGraphView.bind(this)

        this.removeCollection = this.removeCollection.bind(this)
        // this.exploreNode = this.exploreNode.bind(this)
        // this.duplicateNode = this.duplicateNode.bind(this)
        this.addRelation = this.addRelation.bind(this)
    }

    editCollection() {
        const { history, page, id } = this.props
        history.push(`/app/${page}/${id}/edit`)
    }

    toGraphView() {
        const { history, page, id } = this.props
        history.push(`/app/${page}/${id}/`)
    }

    addRelation() {
        this.props.showAddCollectionRelationWindow(this.props.id)
    }

    removeCollection() {
        const { history, page, id } = this.props

        const result = window.confirm(`Are you sure you want to remove '${this.props.collection.name}'`)
        if (result) {
            this.props.removeCollection(this.props.collection.id)
                .then(() => history.push(`/app/${page}/`))
        }
    }


    render() {
        const { collection, loadingStates } = this.props

        if (!collection) return null

        // keymapping handlers, see App.js
        const handlers = {
            // 'explore': this.exploreNode,
            // 'addRelation': this.addRelation,
            // 'duplicate': this.duplicateNode,
            // 'trash': this.removeCollection,
        }

        return (
            <HotKeys focused={true} attach={document.getElementById('app')} handlers={handlers} style={{ width: '100%' }}>
                <div className="nodeToolbar">
                    <div className="nodeToolbar-loadingState">
                        <SavedState />
                        { loadingStates.GET_COLLECTION ? <InlineSpinner size={1} /> : null }
                    </div>
                    <div className="nodeToolbar-title">
                        <NodeTitle 
                            title={collection.name} 
                            updateNode={this.props.updateCollection.bind(this, collection.id)}
                        />
                        <NodeSubtitle
                            node={this.props.collection}
                        />
                    </div>
                    <div className="nodeToolbar-cardActions">
                        <EditButton
                            onTouchTap={this.editCollection}
                        />
                        <CollectionDetailButton id={collection.id} />
                        <AddRelationButton
                            onTouchTap={this.addRelation}
                        />
                        <TrashButton 
                            onClick={this.removeCollection}
                        />
                    </div>
                </div>
            </HotKeys>
        );
    }
}

import { getCollection } from '../../reducers'
import { updateCollection, removeCollection, removeEdge } from '../../actions/async'
import { showAddCollectionRelationWindow } from '../../actions/ui'

function mapStateToProps(state, props) {
    const id = props.match.params && props.match.params.id

    const selectedCollection = getCollection(state, id)

    return {
        opened: state.uiState.showGraphSideBarOpened,
        collection: selectedCollection,
        loadingStates: state.loadingStates,
    }
}

export default withRouter(connect(mapStateToProps, {
    updateCollection,
    removeCollection,
    removeEdge,
    showAddCollectionRelationWindow,
})(CollectionToolbar));
