
import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { TextField } from 'material-ui'
import RefreshIndicator from 'material-ui/RefreshIndicator';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import { DebouncedTextField } from '../../components/Input'

import { getNode, getEdgesFromNode, getEdgesToNode, getCollectionsByNodeId, isSynced } from '../../reducers'

import NodeDetailGraph from '../../containers/NodeDetailGraph'
import NodeSearch from '../../containers/NodeSearch'
import SavedState from '../../containers/SavedState'
import NodeCollectionList from '../../components/NodeCollectionList'
import { SelectedEdgesTo, SelectedEdgesFrom } from '../../components/SelectedEdges'
import ExploreButton from '../../components/ExploreButton'
import { TrashButton, EditButton } from '../../components/Buttons'

import ContentEditor from '../../containers/NodeContentEditor'

import { accentColor, secondaryTextColor } from '../../containers/App/muitheme.js'

import './styles.css'

const styles = {

    topbar: {
        display: 'flex',
        alignItems: 'flex-start',
        // border: '1px solid #ddd',
    },
    actions: {
        width: '80%',
        display: 'flex',
        flexWrap: 'wrap',
        // alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftActions: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    rightActions: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    nodeDetailGraph: {
        position: 'absolute',
        width: '250px',
        right: 0,
        top: 0
    },
    mainActions: {
        
    },
    addRelation: {
        display: 'inline-flex',
    },
    contentEditor: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },


    actionButtons: {
        display: 'inline-flex',
        marginLeft: '1rem',
    },
    nodeTitle: {
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
        width: '80%',
        color: accentColor,
        cursor: 'pointer',
    },
    nodeTitleH2: {
        fontSize: '1.6rem',
    },

    nodeSubtitle: {
        fontSize: '1rem',
        color: secondaryTextColor,
    },
};

const LoadingIndicator = () => (
    <RefreshIndicator
        size={40}
        status="loading"
    />
)

function loadData(props) {
    props.loadNodeL1(props.id)
}

import EditableTitle from '../../components/EditableTitle'
import moment from 'moment'

export const NodeTitle = ({ title, updateNode }) => (
    <span>
        <EditableTitle 
            title={title}
            updateNode={updateNode}
        />
    </span>
)
export const NodeSubtitle = ({ node }) => (
    <span style={styles.nodeSubtitle}>
        { moment.unix(node.properties.modified / 1000).fromNow() } 
    </span>   
)

export class NodeDetail extends React.Component {
    constructor(props) {
        super(props)
        this.updateNode = this.updateNode.bind(this)
        this.connectNodes = this.connectNodes.bind(this)
        this.removeNode = this.removeNode.bind(this)

        this.state = {
            'direction': 'to'
        }
    }

    componentWillMount() {
        loadData(this.props)
        this.props.setTitle('Node Detail')
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id) {
            loadData(nextProps)
        }
    }

    connectNodes(ESNode) {
        const { id } = this.props
        const { direction } = this.state

        const source = direction === 'to' ? id : ESNode._id
        const target = direction === 'to' ? ESNode._id : id

        this.props.connectNodes(source, target, direction) 
    }

    updateNode(obj) {
        // TODO: shouldn't be nescessary anymore, server does partial update - 2016-08-08
        const { id, node: { properties } } = this.props

        const newProperties = Object.assign({}, properties, obj)

        this.props.updateNode(id, newProperties)
    }

    removeNode() {
        const result = window.confirm("Are you sure you want to delete this node, including all of its links?")
        if (result) {
            this.props.removeNode(this.props.id)
                .then(() => this.props.router.push(`/app/nodes`))
        }
    }

    render() {
        const { node, edgesFrom, edgesTo, saved, removeEdge } = this.props

        if (!node) {
            return <h1>Loading node...</h1>
        }

        return (
            <div className="nodeDetail">
                <div style={styles.topbar}>
                    <SavedState />
                    
                    <div style={styles.nodeDetailGraph}>
                        <NodeDetailGraph id={this.props.id} />
                    </div>
                </div>
                <div style={styles.mainActions}>
                    <div style={styles.nodeTitle}>
                        <NodeTitle 
                            title={this.props.node.properties.name} 
                            updateNode={this.props.updateNode.bind(this, this.props.id)}
                        />
                        <NodeSubtitle
                            node={this.props.node}
                        />
                    </div>
                    <div style={{width: '80%', textAlign: 'center'}}>
                        <NodeCollectionList 
                            addNodeToCollection={this.props.addNodeToCollection}
                            removeNodeFromCollection={this.props.removeNodeFromCollection}
                            showCreateCollectionWindow={this.props.showCreateCollectionWindow}
                            createCollection={this.props.createCollection}
                            node={this.props.node}
                            collections={this.props.collections}
                        />
                    </div>
                </div>
                <div style={styles.actions}>
                        <div style={styles.leftActions}>
                            <div style={styles.actionButtons}>
                                <ExploreButton 
                                    id={this.props.id} 
                                    name={this.props.node.properties.name}
                                />
                                <TrashButton 
                                    onClick={this.removeNode}
                                />
                            </div>
                        </div>
                        <div style={styles.rightActions}>
                            <RadioButtonGroup
                                onChange={value => this.setState({ direction: value})}
                                value={this.state.direction}
                                name="direction"
                                defaultSelected="to"
                                style={{marginRight: '15px'}}
                            >
                                    { /* style={{display: 'inline-block', width: 'auto', verticalAlign: 'middle'}} */}
                                <RadioButton
                                    value="from"
                                    label="From"
                                />
                                <RadioButton
                                    value="to"
                                    label="To"
                                />
                            </RadioButtonGroup>
                            <div>
                                <NodeSearch
                                    id={this.props.id}
                                    placeholder={"Add a relation..."}
                                    onSearchClick={this.connectNodes}
                                />
                            </div>
                        </div>
                    </div>
                <div style={styles.contentEditor}> 
                    <ContentEditor 
                        id={this.props.id} 
                        node={this.props.node}
                    />
                </div>
            </div>
        )
    }
}
NodeDetail.propTypes = {
    id: PropTypes.string.isRequired,
    node: PropTypes.object,
    saved: PropTypes.bool.isRequired,
}

function mapStateToProps(state, props) {
    const { id } = props.params

    return {
        id: id,
        node: getNode(state, id),
        saved: isSynced(state),
        edgesFrom: getEdgesFromNode(state, id),
        edgesTo: getEdgesToNode(state, id),
        collections: getCollectionsByNodeId(state, id)
    }
}

import { loadNode, loadNodeL1, updateNode, removeNode, connectNodes, removeEdge, addEdge, addNodeToCollection, removeNodeFromCollection, createCollection } from '../../actions/async'
import { showCreateCollectionWindow, setTitle } from '../../actions/ui'

export default connect(mapStateToProps, {
    loadNodeL1,
    updateNode,
    removeNode,
    connectNodes,
    addEdge,
    removeEdge,
    addNodeToCollection,
    removeNodeFromCollection,
    createCollection,
    showCreateCollectionWindow,
    setTitle,
})(withRouter(NodeDetail))
