

import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import d3 from 'd3'

import { getCollections, getActiveCollections, getNodesByActiveCollectionIds, getEdgesByActiveCollectionIds } from '../../reducers.js'

import RaisedButton from 'material-ui/RaisedButton';
import {List, ListItem} from 'material-ui/List'
import Subheader from 'material-ui/Subheader';
import Checkbox from 'material-ui/Checkbox';

import CollectionExploreGraph from '../../containers/CollectionExploreGraph'
import NodeEditor from '../../containers/NodeEditor'

import './styles.css'

import { secondaryTextColor } from '../App/muitheme.js'

class CollectionToggle extends React.Component {
    /*
     * List of collection checkboxes
     */
    constructor(props) {
        super(props)

        this.onToggle = this.onToggle.bind(this)
        this.toggleCollections = this.toggleCollections.bind(this)

        this.state = {
            checked: {}, // list of checked items
        }
    }

    componentWillMount() {
        // TODO: shouldn't be nescessary, pretty ugly... - 2016-08-18
        // set initial checked state
        if (this.props.activeCollections) {
            this.setState({
                checked: _.keyBy(this.props.activeCollections, 'id')
            })
        }
    }

    onToggle(id, e, checked) {
        if (checked) {
            this.setState({ 
                checked: { ...this.state.checked, [id]: true }
                // checked: [ ...this.state.checked, id ] 
            })
        }
        else {
            this.setState({
                checked: _.omit(this.state.checked, id),
                // checked: { ...this.state.checked, [id]: false }
            })
        }
    }

    toggleCollections() {
        this.props.toggleCollections(Object.keys(this.state.checked))
    }

    render() {
        console.log(this.state.checked);
        const listItems = this.props.collections.map(collection => (
            <ListItem 
                primaryText={collection.properties.name} 
                leftCheckbox={
                    <Checkbox 
                        onCheck={this.onToggle.bind(this, collection.id)} 
                        checked={this.state.checked[collection.id]}
                    />
                }
            />
        ))

        const styles = {
            collectionToggleSubheader: {
                display: 'block',
                color: secondaryTextColor,
                fontSize: '14px',
                fontWeight: 500,
                padding: '16px',
            }
        }

        return (
            <div style={this.props.style}>
                <RaisedButton 
                    style={{marginLeft: '10px'}}
                    label="Compare" 
                    onTouchTap={this.toggleCollections}
                />
                <List>
                    <span style={styles.collectionToggleSubheader}>
                        Choose collections to compare
                    </span>
                    { listItems }
                </List>

            </div>

        )
    }
}
CollectionToggle.propTypes = {

}

export const NoCollectionsYet = (props) => (
    <div className="collectionExplore-noCollectionsYet">
        <span className="collectionExplore-noCollectionsYet-text">
            Select the collections you want to compare!<br/>
        </span>
        <CollectionToggle 
            collections={props.collections} 
            toggleCollections={props.toggleCollections}
        />
    </div>
)

class CollectionExplore extends React.Component {
    /*
     * An overview graph, where one can toggle collections to add to the graph
     */

    constructor(props) {
        super(props)

        this.setCollections = this.setCollections.bind(this)
        this.connectNodes = this.connectNodes.bind(this)
    }

    componentWillMount() {
        const { params } = this.props
        this.props.fetchCollections()
        this.props.setTitle('Collection Explore')

        if (params && params.id) {
            this.setCollections([params.id])
        }
    }

    componentWillUnmount() {
        // TODO: instead get activeCollection state from url parameter - 2016-08-18
        this.props.setActiveCollections([])
    }

    setCollections(collectionIds) {
        // TODO: Fetch collections from the server (check if we have collections in cache first) - 2016-07-13
        console.log('selected ids... ' + collectionIds);

        this.props.loadCollectionsByIds(collectionIds)
            .then(actions => this.props.setActiveCollections(collectionIds))

        // set the id
    }

    connectNodes(from, to) {
        // TODO: temporarity until we get a better solution... - 2016-07-29
        console.log(`called connectNodes from ${from} to ${to}`);
        const collectionIds = this.props.activeCollections.map(x => x.id)

        this.props.connectNodes(from, to)
            .then(() => this.props.loadCollectionsByIds(collectionIds))
    }

    render() {
        const { collections, activeCollections, nodes, links } = this.props
        console.log(activeCollections);

        return (
            activeCollections.length ? 
                <div className="collectionExplore">
                    <NodeEditor 
                        className="collectionExplore-sidebar"
                    />
                    <div className="collectionExplore-collectionSelect">
                        <CollectionToggle 
                            collections={collections} 
                            activeCollections={activeCollections}
                            toggleCollections={this.setCollections}
                        />
                    </div>
                    {/* // TODO: connectNodes without a full reload... - 2016-07-29 */}
                    <div className="collectionExplore-graph">
                        <CollectionExploreGraph 
                            nodes={nodes}
                            links={links} 
                            connectNodes2={this.connectNodes}
                        />
                    </div>
                </div>
                :
                <div className="collectionExplore">
                    <NoCollectionsYet
                        collections={collections}
                        toggleCollections={this.setCollections}
                    />
                </div>
        )
    }
}
CollectionExplore.propTypes = {
    nodes: PropTypes.arrayOf(PropTypes.object).isRequired,
    links: PropTypes.arrayOf(PropTypes.object).isRequired,
    connectNodes: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
    // get collections for the active collection id's
    return {
        collections: getCollections(state),
        activeCollections: getActiveCollections(state),
        nodes: getNodesByActiveCollectionIds(state),
        links: getEdgesByActiveCollectionIds(state),
    }
}

import { loadCollectionsByIds, connectNodes, fetchCollections } from '../../actions/async'
import { setActiveCollections, setTitle } from '../../actions/ui'

export default connect(mapStateToProps, {
    connectNodes,
    loadCollectionsByIds,
    setActiveCollections,
    fetchCollections,
    setTitle,
})(CollectionExplore)
