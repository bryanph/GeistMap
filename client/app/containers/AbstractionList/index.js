/*
 *
 * NodeCollectionListContainer
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router'

import {
    toggleCollapse
} from '../../actions/ui'

import {
    removeAbstraction,
    fetchNodeL1,
} from '../../actions/async'

import './styles.scss'

class AbstractionList extends React.Component {

    constructor(props) {
        super(props)

        this.focusAbstraction = this.focusAbstraction.bind(this)
        this.removeAbstraction = this.removeAbstraction.bind(this)
    }

    removeAbstraction(id) {
        /*
         * Permanently collapse this node
         *
         * 1. change node type to 'node'
         * 2. all edges from this collection to its nodes should become normal
        */

        this.props.removeAbstraction(this.props.activeCollection.id, id)
            .then(() => this.props.fetchNodeL1(id, this.props.activeCollection.id))
    }

    focusAbstraction(id) {
        /*
         * Route to the collection
         *
         * 1. change node type to 'node'
         * 2. all edges from this collection to its nodes should become normal
        */
        this.props.history.push(`/app/collections/${id}/nodes`)
    }


    render() {
        const { collections } = this.props

        const collectionItems = collections.map(c => (
            <AbstractionItem
                key={c.id}
                collection={c}
                onToggleCollapse={this.props.toggleCollapse}
                removeAbstraction={this.removeAbstraction}
                focusAbstraction={this.focusAbstraction}
            />
        ))

        return (
            <div className="abstractionList">
                { collectionItems }
            </div>
        );
    }
}

import { Checkbox } from 'semantic-ui-react'
import { Button, Icon } from 'semantic-ui-react'

class AbstractionItem extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { collection, onToggleCollapse, removeAbstraction, focusAbstraction } = this.props

        return (
            <div className="abstractionList-item">
                <span>{ collection.name }</span>
                <Checkbox
                    toggle
                    checked={collection.collapsed}
                    onChange={() => onToggleCollapse(collection.id)}
                />
                <Button onClick={() => focusAbstraction(collection.id)} icon>
                    <Icon name='crosshairs' />
                </Button>
                <Button onClick={() => removeAbstraction(collection.id)} icon>
                    <Icon name='remove' />
                </Button>

            </div>
        )
    }
}

// export default AbstractionList

export default connect(null, {
    toggleCollapse,
    removeAbstraction,
    fetchNodeL1,
})(withRouter(AbstractionList))
