/*
 *
 * NodeCollectionListContainer
 *
 */

import React from 'react';
import Portal from 'react-portal'
import { connect } from 'react-redux';
import { withRouter } from 'react-router'
import classNames from 'classnames'

import {
    toggleCollapse,
    showAbstractionSidebar,
    hideAbstractionSidebar,
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
        this.expandClick = this.expandClick.bind(this)
        this.onFocusClick = this.onFocusClick.bind(this)
    }

    expandClick() {
        console.log("called expandclick")
        const opened = this.props.opened
        return opened ? this.props.hideAbstractionSidebar() : this.props.showAbstractionSidebar()
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

    onFocusClick(collection) {
        console.log("called focus click")
        // TODO: should follow the correct abstraction chain - 2017-09-21

        const newCollectionChain = [ ...this.props.collectionChainIds, collection.id ]
        this.props.history.push(`/app/collections/${newCollectionChain.join('/')}/nodes`)
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.isLoading ? false : true
    }

    render() {
        const { collections, opened } = this.props

        const collectionItems = collections.map(c => (
            <AbstractionItem
                key={c.id}
                collection={c}
                onToggleCollapse={this.toggleCollapse}
                removeAbstraction={this.removeAbstraction}
                focusAbstraction={this.focusAbstraction}
            />
        ))

        const containerClass = classNames("abstractionList-container", {
            "abstractionList-show": opened
        })

        console.log(containerClass)
        if (this.props.isLoading) {
            return null;
        }

        return (
            <div className={ containerClass }>
                <Portal isOpened={true}>
                    <ExpandButton 
                        expanded={opened}
                        onClick={this.expandClick}
                    />
                </Portal>
                <AbstractionHeading
                    title={this.props.activeCollection.name}
                    onToggle={this.props.toggleAbstractionSidebar}
                />
                <AbstractionTree 
                    data={this.props.nodeTree}
                    onToggle={this.toggleCollapse}
                    onToggleExpand={this.toggleCollapse}
                    onFocusClick={this.onFocusClick}
                />
            </div>
        );
    }
}

import { Button, Icon } from 'semantic-ui-react'

export const ExpandButton = ({ expanded, onClick }) => {

    const icon = expanded ? "chevron left" : "chevron right"
    const className = classNames({
        "abstractionList-expandButton-expanded": expanded,
        "abstractionList-expandButton-collapsed": !expanded,

    })

    return (
        <div className={className}>
            <Button size="mini" icon onClick={onClick}>
                <Icon name={ icon } />
            </Button>
        </div>
    )
}

export const AbstractionHeading = (props) => {
    return (
        <div className="abstractionList-heading">
            <div className="title">
                { props.title }
            </div>
        </div>
    )
}


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
function mapStateToProps(state) {
    return {
        opened: state.uiState.abstractionSidebar.opened
    }
}

export default connect(mapStateToProps, {
    toggleCollapse,
    removeAbstraction,
    fetchNodeL1,
    loadCollectionL1,
    showAbstractionSidebar,
    hideAbstractionSidebar,
})(withRouter(AbstractionList))
