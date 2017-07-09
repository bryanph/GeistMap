/*
 *
 * NodeCollectionListContainer
 *
 */

import React from 'react';
import { connect } from 'react-redux';

import {
    toggleCollapse
} from '../../actions/ui'

class AbstractionList extends React.Component {

    constructor(props) {
        super(props)

        this.removeAbstraction = this.removeAbstraction.bind(this)
    }

    removeAbstraction() {
        /*
         * Permanently collapse this node
        */

    }


    render() {
        const { collections } = this.props

        const collectionItems = collections.map(c => (
            <AbstractionItem 
                collection={c} 
                onToggleCollapse={this.props.toggleCollapse}
                removeAbstraction={this.props.removeAbstraction}
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
        const { collection, onToggleCollapse, removeAbstraction } = this.props

        console.log(collection);

        return (
            <div className="abstractionList-item">
                <span>{ collection.name }</span>
                <Checkbox
                    toggle
                    checked={collection.collapsed}
                    onChange={() => onToggleCollapse(collection.id)}
                />
                <Button onClick={removeAbstraction} icon>
                    <Icon name='remove' />
                </Button>

            </div>
        )
    }
}

// export default AbstractionList

export default connect(null, {
    toggleCollapse,
})(AbstractionList)
