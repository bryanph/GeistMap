/**
 *
 * NodeCollectionList
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux'
import enhanceWithClickOutside from 'react-onclickoutside'
import Chip from 'material-ui/Chip';

import NodeSearch from '../../containers/NodeSearch'
import { primaryColor, secondaryColor } from '../../containers/App/muitheme'

import {
    addNodeToCollection,
    removeNodeFromCollection,
} from '../../actions/collection'

import {
    createNode
} from '../../actions/node'


import './styles.scss';

const styles = {
    chip: {
        margin: 4,
    },
    wrapper: {
        display: 'flex',
        flexWrap: 'wrap',
    },
};

class NodeCollectionList extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            searchToggle: false,
            open: false,
            defaultValues: {
                name: "",
                desription: "",
            }
        }

        this.toggleSearch = this.toggleSearch.bind(this)
        this.addNodeToCollection = this.addNodeToCollection.bind(this)
        this.createAndAddNodeToCollection = this.createAndAddNodeToCollection.bind(this)
        this.removeNodeFromCollection = this.removeNodeFromCollection.bind(this)
        this.handleClickOutside = this.handleClickOutside.bind(this)
    }

    toggleSearch() {
        this.setState({ searchToggle: true })
    }

    addNodeToCollection(ESCollection) {
        // _id here, because this is an elastic search node representation
        this.props.addNodeToCollection(ESCollection._id, this.props.node.id)

        this.setState({ searchToggle: false })
    }

    createAndAddNodeToCollection(label) {
        // add a new node to the graph
        if (!label) {
            return;
        }

        this.props.createNode({ name: label })
            .then(action => action.response.result)
            .then(id => this.props.addNodeToCollection(
                id,
                this.props.node.id,
            ))

        this.setState({ searchToggle: false })
    }

    removeNodeFromCollection(collectionId) {
        this.props.removeNodeFromCollection(collectionId, this.props.node.id)
    }

    handleClickOutside(event) {
        if (this.state.open) {
            return;
        }
        this.setState({ searchToggle: false })
    }

    render() {
        const { collections } = this.props

        const handlers = {
            'addCollection': this.toggleSearch
        }

        return (
            <div className='nodeCollectionList'>
                { _.map(collections, col => (
                    <NodeCollectionItem 
                        key={col.id}
                        id={col.id}
                        nodeId={this.props.node.id}
                        name={col.name}
                        onDelete={this.removeNodeFromCollection}
                    />)
                )}

                {
                    !this.state.searchToggle ?
                        <Chip
                            backgroundColor={secondaryColor}
                            onClick={this.toggleSearch}
                            style={styles.chip}
                        >Add Parent
                        </Chip>
                        : 
                        <div style={{ width: "300px" }}>
                            <NodeSearch 
                                floatBelow={ true }
                                floatingLabel={"Search for a collection..."}
                                onSearchClick={this.addNodeToCollection} 
                                onClick={this.createAndAddNodeToCollection}
                            />
                        </div>
                }
            </div>
        );
    }
}

import { withRouter } from 'react-router-dom'

// TODO: change to Link components - 2016-07-12
export const NodeCollectionItem = withRouter((props) => {
    return (
        <Chip
            onRequestDelete={() => props.onDelete(props.id)}
            onClick={() => props.history.push(`/app/nodes/${props.id}/graph`)}
            style={styles.chip}
        >
            { props.name }
        </Chip>
    )

})

export default connect(null, {
    addNodeToCollection,
    removeNodeFromCollection,
    createNode,
})(enhanceWithClickOutside(NodeCollectionList))
