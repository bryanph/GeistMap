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
    moveChild,
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

        this.removeAbstraction = this.removeAbstraction.bind(this)
        this.toggleCollapse = this.toggleCollapse.bind(this)
        this.expandClick = this.expandClick.bind(this)
        this.onFocusClick = this.onFocusClick.bind(this)
    }

    expandClick() {
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

        this.props.removeAbstraction(id)
    }

    toggleCollapse(collection, collapsed) {
        /*
         * 1. fetch the collection to collapse if it hasn't been fetched yet
         * 2. toggle the collapse
        */

        if (collection.collapsed) {
            this.props.loadCollectionL1(collection.id)
                .then(() => this.props.toggleCollapse(collection.id))
        } else {
            this.props.toggleCollapse(collection.id)
        }
    }

    onFocusClick(collection) {
        this.props.history.push(`/app/collections/${collection.id}/nodes`)
        this.props.moveChild(collection.id)
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.isLoading ? false : true
    }

    render() {
        const { opened } = this.props

        const containerClass = classNames("abstractionList-container", {
            "abstractionList-show": opened
        })

        if (this.props.isLoading) {
            return null;
        }

        return (
            <div>
                <ExpandButton 
                    expanded={opened}
                    onClick={this.expandClick}
                />
                <div className={ containerClass }>
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
    moveChild,
})(withRouter(AbstractionList))
