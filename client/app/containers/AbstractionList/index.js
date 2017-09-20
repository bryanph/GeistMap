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
    fetchNodeL1,
} from '../../actions/node'
import {
    removeAbstraction,
    loadCollectionL1,
} from '../../actions/collection'

import './styles.scss'


import AbstractionTree from './components/root'

class AbstractionList extends React.Component {

    constructor(props) {
        super(props)

        this.focusAbstraction = this.focusAbstraction.bind(this)
        this.removeAbstraction = this.removeAbstraction.bind(this)
        this.toggleCollapse = this.toggleCollapse.bind(this)
    }

    removeAbstraction(id) {
        /*
         * Permanently collapse this node
         *
         * 1. change node type to 'node'
         * 2. all edges from this collection to its nodes should become normal
        */

        this.props.removeAbstraction(id, this.props.collectionChainIds)
    }

    focusAbstraction(id) {
        /*
         * Route to the collection
         *
         * 1. change node type to 'node'
         * 2. all edges from this collection to its nodes should become normal
        */
        const newCollectionChain = [ ...this.props.collectionChainIds, id ]
        this.props.history.push(`/app/collections/${newCollectionChain.join('/')}/nodes`)
    }

    toggleCollapse(collection, collapsed) {
        /*
         * 1. fetch the collection to collapse if it hasn't been fetched yet
         * 2. toggle the collapse
        */

        console.log(collection)

        // TODO: separate fetching the chain and L1 collection - 2017-09-17
        const newCollectionChain = collection.collectionChains[0]

        if (collection.collapsed) {
            this.props.loadCollectionL1(collection.id, newCollectionChain)
                .then(() => this.props.toggleCollapse(collection.id))
        } else {
            this.props.toggleCollapse(collection.id)
        }
    }


    render() {
        const { collections } = this.props

        const collectionItems = collections.map(c => (
            <AbstractionItem
                key={c.id}
                collection={c}
                onToggleCollapse={this.toggleCollapse}
                removeAbstraction={this.removeAbstraction}
                focusAbstraction={this.focusAbstraction}
            />
        ))

        return (
            <div className="abstractionList">
                <AbstractionTree 
                    data={this.props.nodeTree}
                    onToggle={this.toggleCollapse}
                />
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
                    onChange={() => onToggleCollapse(collection)}
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
    loadCollectionL1,
})(withRouter(AbstractionList))
