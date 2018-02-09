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

import { hideAddNodeWindow } from '../../actions/ui'

import enhanceWithClickOutside from 'react-onclickoutside'

class AddNodeWindow extends React.Component {
    constructor(props) {
        super(props)

        this.addExistingNode = this.addExistingNode.bind(this)
        this.addNewNode = this.addNewNode.bind(this)
    }

    addExistingNode(esResult) {
        // add existing node to the graph
        const id = esResult._id
        const { parentNodeId } = this.props

            return this.props.addNodeToCollection(
                parentNodeId,
                id,
            )
    }

    addNewNode(label) {
        // add a new node to the graph
        if (!label) {
            return;
        }

        const { parentNodeId } = this.props

        this.props.createNode({ name: label })
            .then(action => action.response.result)
            .then(id => this.props.addNodeToCollection(parentNodeId, id))
    }

    componentDidUpdate(nextProps) {

    }

    handleClickOutside() {
        /*
         * when clicking outside of the window
        */
        if (this.props.opened) {
            this.props.hideAddNodeWindow()
        }
    }

    render() {
        const { opened } = this.props

        const containerClass = classNames('addNodeWindow', { visible: opened })

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
    hideAddNodeWindow,
})(enhanceWithClickOutside(AddNodeWindow));

