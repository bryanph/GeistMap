
import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'

import { TextField } from '../../components/Input'
import { List, ListItem } from 'material-ui/List'

import { searchCollection, resetSearchCollection } from '../../actions/async'
import { showCreateCollectionWindow } from '../../actions/ui'

import './styles.css'
import { withRouter } from 'react-router-dom'

import enhanceWithClickOutside from 'react-onclickoutside'

import { accentColor } from '../App/muitheme'

const styles = {
    directMatch: {
        color: accentColor,
    }
}

const CollectionSearchList = withRouter(enhanceWithClickOutside(
class extends React.Component {
    constructor(props) {
        super(props)

        this.createCollection = this.createCollection.bind(this)
        this.onClick = this.onClick.bind(this)
        this.handleClickOutside = this.handleClickOutside.bind(this)

        this.state = {
            open: true,
        }
    }

    createCollection() {
        this.props.createCollection({
            name: this.props.searchValue,
            description: "",
        })
    }

    componentDidUpdate(nextProps) {
        if (this.props.searchValue !== nextProps.searchValue) {
            this.setState({ open: true })
        }
    }

    onClick(result) {
        this.setState({ open: false })
        this.props.onClick(result)
    }

    handleClickOutside() {
        // reset search results
        // this.setState({ open: false })
        // this.props.resetSearchCollection()
    }

    render() {
        const { searchResults, searchValue } = this.props

        if (!this.state.open || searchValue.length === 0) {
            return null
        }

        const listItems = _.map(searchResults, result => (
            <ListItem 
                onTouchTap={() => this.onClick(result)}
                primaryText={result._source.title}
            />
        ))

        const directMatch = _.find(searchResults, (r) => r._source.title === searchValue)

        // TODO: make this div free-floating relative to some defined block - 2016-07-11
        return (
            <div className='collectionSearch-list'>
                        <List>
                            {
                                !directMatch ?
                                <ListItem 
                                    onTouchTap={this.createCollection}
                                    primaryText={`Create "${searchValue}"`}
                                    innerDivStyle={styles.directMatch}
                                />
                                : null
                            }
                            { listItems }
                        </List>
            </div>
        )
    }
}))

class CollectionSearch extends React.Component {
    constructor(props) {
        super(props)

        // this.createCollection = this.createCollection.bind(this)
        this.searchCollection = _.debounce(this.props.searchCollection, 100).bind(this)

        this.state = {
            searchValue: "",
        }

        this.onChange = this.onChange.bind(this)
    }

    onChange(e) {
        this.setState({ searchValue: e.target.value })

        this.searchCollection(e.target.value)
    }

    // createCollection(collection) {
    //     this.props.showCreateCollectionWindow(collection)
    //         // .then(action => action.response.result)
    //         // .then(id => this.props.history.push(`/app/collections/${id}`))
    // }

    render() {
        const { searchResults } = this.props

        return (
            <div className={'collectionSearch'}>
                <TextField
                    hintText={"search for a collection.."}
                    style={{width: '100%'}}
                    onChange={this.onChange}
                    autoFocus
                />
                <CollectionSearchList
                    createCollection={this.props.createCollection}
                    searchValue={this.state.searchValue}
                    searchResults={searchResults}
                    onClick={this.props.onSearchClick}
                    resetSearchCollection={this.props.resetSearchCollection}
                />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {
        searchResults: state.collectionSearch,
    }
}

export default connect(mapStateToProps, { searchCollection, resetSearchCollection, showCreateCollectionWindow })(CollectionSearch)
