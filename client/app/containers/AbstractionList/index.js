/*
 *
 * NodeCollectionListContainer
 *
 */

import React from 'react';
import Portal from 'react-portal'
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom'
import QueryLink from 'QueryLink'
import classNames from 'classnames'

import {
    toggleCollapse,
    showAbstractionSidebar,
    hideAbstractionSidebar,
    moveChild,
    moveParent,
} from '../../actions/ui'

import {
    fetchNodeL1,
    updateNode,
} from '../../actions/node'

import './styles.scss'


import { Button, Icon } from 'semantic-ui-react'
import AbstractionTree from './components/root'
import { getAbstractionChain } from '../../reducers'


export const ExpandButton = ({ expanded, onClick }) => {

    const icon = expanded ? "chevron right" : "chevron left"
    const className = classNames(
        "abstractionList-expandButton",
        {
            "abstractionList-expandButton-expanded": expanded,
            "abstractionList-expandButton-collapsed": !expanded,
        }
    )

    return (
        <div className={className}>
            <Button icon onClick={onClick}>
                <Icon name={ icon } />
            </Button>
        </div>
    )
}


const AbstractionItem = ({ url, name, hasNext, onClick }) => (
    <div className="abstractionHeader-item">
        <QueryLink to={url} onClick={onClick}>{ name }</QueryLink>
        {
            hasNext ? <Icon name="angle right" /> : null
        }
    </div>
)

const AbstractionHeading = (props) => {

    const abstractionItems = props.abstractionChain.map((c, i) => (
        <AbstractionItem
            key={i}
            url={`/app/nodes/${c.id}/graph`}
            name={c.name}
            hasNext={ i < (props.abstractionChain.length - 1) }
            onClick={() => props.moveParent(c.id)}
        />
    ))

    return (
        <div className="abstractionList-heading">
            <div className="abstractionList-navigate">
                { abstractionItems }
            </div>

            <div className="title">
                { props.title }
            </div>
        </div>
    )
}

class AbstractionList extends React.Component {

    constructor(props) {
        super(props)

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
         * // TODO: should move all children to the parent - 2018-03-16
         */
    }

    toggleCollapse(collection, collapsed) {
        /*
         * 1. fetch the collection to collapse if it hasn't been fetched yet
         * 2. toggle the collapse
         */

        if (collection.collapsed) {
            // this.props.loadCollectionL1(collection.id)
            //     .then(() => this.props.toggleCollapse(collection.id))
            this.props.toggleCollapse(collection.id)
        } else {
            this.props.toggleCollapse(collection.id)
        }
    }

    onFocusClick(collection) {
        this.props.history.push({
            pathname: `/app/nodes/${collection.id}/graph`,
            search: this.props.location.search
        })
        this.props.moveChild(collection.id)
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.isLoading ? false : true
    }

    render() {
        const { opened, abstractionChain, isLoading } = this.props

        const containerClass = classNames("abstractionList-container", {
            "abstractionList-show": opened
        })

        if (!this.props.focusNode) {
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
                        title={this.props.focusNode.name}
                        onToggle={this.props.toggleAbstractionSidebar}
                        abstractionChain={abstractionChain.splice(0, abstractionChain.length-1)}
                        moveParent={this.props.moveParent}
                    />
                    <AbstractionTree 
                        data={this.props.nodeTree.children}
                        onToggle={this.toggleCollapse}
                        onToggleExpand={this.toggleCollapse}
                        onFocusClick={this.onFocusClick}
                        updateNode={this.props.updateNode}
                    />
                </div>
            </div>
        );
    }
}

// export default AbstractionList
function mapStateToProps(state) {
    return {
        opened: state.uiState.abstractionSidebar.opened,
        abstractionChain: getAbstractionChain(state),
    }
}

export default connect(mapStateToProps, {
    toggleCollapse,
    fetchNodeL1,
    showAbstractionSidebar,
    hideAbstractionSidebar,
    moveChild,
    moveParent,
    updateNode,
})(withRouter(AbstractionList))
