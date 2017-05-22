/**
 *
 * NodeCollectionList
 *
 */

import React, { PropTypes } from 'react';

import './styles.css';
import CollectionSearch from '../../containers/CollectionSearch'
import CollectionCreateWindow from '../../components/CollectionCreateWindow'
import Chip from 'material-ui/Chip';
import enhanceWithClickOutside from 'react-onclickoutside'

import { primaryColor, secondaryColor } from '../../containers/App/muitheme'
import { HotKeys } from 'react-hotkeys';

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

    handleClickOutside() {
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
            <HotKeys focused={true} attach={document.getElementById('app')} handlers={handlers}>
                <CollectionCreateWindow
                    defaultValues={this.state.defaultValues}
                    open={this.state.open}
                    createCollection={this.props.createCollection}
                    hideWindow={this.hideWindow}
                    onCompleted={this.onCollectionCreated}
                />

            <div className='nodeCollectionList'>
                { _.map(collections, col => (
                    <NodeCollectionItem 
                        key={col.id}
                        id={col.id}
                        nodeId={this.props.node.id}
                        name={col.properties.name}
                        onDelete={this.removeNodeFromCollection}
                    />)
                )}

                {
                    !this.state.searchToggle ?
                        <Chip
                            backgroundColor={secondaryColor}
                            onTouchTap={this.toggleSearch}
                            style={styles.chip}
                        >Add Collection
                        </Chip>
                        : 
                            /* Style this like the hrefs above */
                        <CollectionSearch 
                            floatingLabel={"Search for a collection..."}
                            onSearchClick={this.addNodeToCollection} 
                            createCollection={this.openWindow}
                        />
                        }
                    </div>
                </HotKeys>
        );
    }
}

import { withRouter } from 'react-router-dom'

// TODO: change to Link components - 2016-07-12
export const NodeCollectionItem = withRouter(({ id, nodeId, name, onDelete, history }) => {
    // {/* 
    //     <a href={`/app/collections/${id}`} className='collection-item'>{ name }</a>
    // */} 
    return (
        <Chip
            onRequestDelete={() => onDelete(id)}
            onTouchTap={() => history.push(`/app/collections/${id}/nodes/${nodeId}`)}
            style={styles.chip}
        >
            { name }
        </Chip>
    )

})
NodeCollectionItem.propTypes = {
    id: PropTypes.string.isRequired,
}

export default enhanceWithClickOutside(NodeCollectionList);
