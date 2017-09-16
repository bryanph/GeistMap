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
    createCollection,
} from '../../actions/collection'

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
        this.openWindow = this.openWindow.bind(this)
        this.hideWindow = this.hideWindow.bind(this)
        this.onCollectionCreated = this.onCollectionCreated.bind(this)
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

    onCollectionCreated(action) {
        // now add node to the collection as well
        const collectionId = action.response.result

        this.props.addNodeToCollection(collectionId, this.props.node.id)
        this.setState({ searchToggle: false })
    }

    removeNodeFromCollection(collectionId) {
        this.props.removeNodeFromCollection(collectionId, this.props.node.id)
    }

    openWindow(collection) {
        this.setState({ open: true, defaultValues: collection })
    }

    hideWindow() {
        this.setState({ open: false })
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

        console.log(collections)

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
                    /*
                    !this.state.searchToggle ?
                        <Chip
                            backgroundColor={secondaryColor}
                            onClick={this.toggleSearch}
                            style={styles.chip}
                        >Add Collection
                        </Chip>
                        : 
                        <NodeSearch 
                            floatingLabel={"Search for a collection..."}
                            onSearchClick={this.addNodeToCollection} 
                            createCollection={this.openWindow}
                        />
                    */
                }
            </div>
        );
    }
}

import { withRouter } from 'react-router-dom'

// TODO: change to Link components - 2016-07-12
export const NodeCollectionItem = withRouter((props) => {
    // {/* 
    //     <a href={`/app/collections/${id}`} className='collection-item'>{ name }</a>
    // */} 
    return (
        <Chip
            onRequestDelete={() => props.onDelete(props.id)}
            onClick={() => props.history.push(`/app/collections/${props.id}/nodes/${props.nodeId}`)}
            style={styles.chip}
        >
            { props.name }
        </Chip>
    )

})

export default connect(null, {
    addNodeToCollection,
    removeNodeFromCollection,
    createCollection,
})(enhanceWithClickOutside(NodeCollectionList))
