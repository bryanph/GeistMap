import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { withRouter } from "react-router-dom"
import Portal from 'react-portal';
import classNames from 'classnames'

import { Button, Modal } from 'semantic-ui-react'

import './styles.scss'

import NodeSearch from '../../containers/NodeSearch'

class AddNodeWindow extends React.Component {
    constructor(props) {
        super(props)

        this.addExistingNode = this.addExistingNode.bind(this)
        this.addNewNode = this.addNewNode.bind(this)
    }

    addExistingNode(node) {
        // add existing node to the graph
    }

    addNewNode(label) {
        // add a new node to the graph

    }

    render() {
        const { opened } = this.props

        const containerClass = classNames('addNodeWindow', { visible: opened })

        return (
            <Portal closeOnEsc closeOnOutsideClick isOpened={opened}>
                <div className={ containerClass }>
                    <div className="addNodeWindow-container">
                        <div className="addNodeWindow-input">
                            <NodeSearch 
                                onSearchClick={this.addExistingNode}
                                onEnter={this.addNewNode}
                            />
                        </div>
                    </div>
                </div>
            </Portal>
        )
    }
}
AddNodeWindow.propTypes = {
    
}

export default AddNodeWindow
