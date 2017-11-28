import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from "react-router-dom"
import Portal from 'react-portal';
import classNames from 'classnames'

import { Button, Modal } from 'semantic-ui-react'

import './styles.scss'

import NodeSearch from '../../containers/NodeSearch'

import {
    createNode,
    addEdge,
    loadNodeL2,
} from '../../actions/node'
import {
    addNodeToCollection
} from '../../actions/collection'

class AddNodeWindow extends React.Component {
    constructor(props) {
        super(props)

        this.addExistingNode = this.addExistingNode.bind(this)
        this.addNewNode = this.addNewNode.bind(this)
    }

    addExistingNode(esResult) {
        // add existing node to the graph
        const id = esResult._id
        const { graphType, activeCollectionId, activeNodeId } = this.props

        if (graphType === "collection") {
            return this.props.addNodeToCollection(
                activeCollectionId,
                id,
            )
        } else {
            return this.props.loadNodeL2(id)
                .then(() =>
                    this.props.addEdge(
                        activeNodeId,
                        id
                    )
                )
        }

    }

    addNewNode(label) {
        // add a new node to the graph
        if (!label) {
            return;
        }

        const { graphType, activeCollectionId, activeNodeId } = this.props

        const createPromise = this.props.createNode({ name: label })
            .then(action => action.response.result)

        if (graphType === "collection") {
            createPromise.then(id => this.props.addNodeToCollection(
                activeCollectionId,
                 id,
             ))
        } else {
            createPromise.then(id => this.props.addEdge(
                activeNodeId,
                 id,
             ))
        }
    }

    render() {
        const { opened } = this.props

        // const containerClass = classNames('addNodeWindow', { visible: opened })
        const containerClass = classNames('addNodeWindow', { visible: true })

        // TODO: disable when disabled prop is true - 2017-06-28
        return (
                <div className={ containerClass }>
                    <div className="addNodeWindow-container">
                        <div className="addNodeWindow-input">
                            <NodeSearch
                                disabled={this.props.disabled}
                                onSearchClick={this.addExistingNode}
                                onEnter={this.addNewNode}
                                onClick={this.addNewNode}
                            />
                        </div>
                    </div>
                </div>
        )
    }
}

export default connect(null, {
    createNode,
    addNodeToCollection,
    addEdge,
    loadNodeL2,
})(AddNodeWindow);
