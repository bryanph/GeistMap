
import _ from 'lodash'
import React, { PropTypes } from 'react'

import { SearchTextField500 } from '../../components/Input/SearchTextField'
import { List, ListItem } from 'material-ui/List'

import enhanceWithClickOutside from 'react-onclickoutside'

import { pure } from 'recompose'

import './styles.css'

const SearchList = enhanceWithClickOutside(
class extends React.Component {
    constructor(props) {
        super(props)

        this.handleClickOutside = this.handleClickOutside.bind(this)
        this.onClick = this.onClick.bind(this)
    }

    handleClickOutside(e) {
        this.props.close()
        // this.props.resetSearchCollection()
    }

    onClick(result) {
        this.setState({ open: false })
        this.props.onClick(result)
    }

    render() {
        const { searchResults, searchValue } = this.props

        const listItems = _.map(searchResults, result => (
            <ListItem 
                onTouchTap={() => this.onClick(result)}
                primaryText={result._source.title || result._source.name}
                secondaryText={result._index === 'collections' ? "Collection" : "Node"}
            />
        ))

        return (
            <div className='nodeSearch-list'>
                {
                    searchResults.length === 0 ?
                        <span className="nodeSearch-no-result">No results. Try another search term</span>
                    :
                        <List>
                            { listItems }
                        </List>
                }
            </div>
            
        )
    }
})
SearchList.propTypes = {
    searchResults: PropTypes.array.isRequired,
}

const styles = {
    // TODO: should be done in parent, not here. - 2016-08-05
    centerSearchField: {
        // textAlign: 'center',
        // verticalAlign: 'middle',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        // flexDirection: 'column',
        // height: '100%'
    }
}

class Search extends React.Component {
    constructor(props) {
        super(props)

        this.onChange = this.onChange.bind(this)
        this.onSearchClick = this.onSearchClick.bind(this)

        this.state = {
            searchValue: "",
            opened: false,
        }
    }

    onChange(e) {
        this.setState({ searchValue: e.target.value })

        this.props.doSearch(e.target.value)
        // this.props.searchAll(e.target.value)
    }

    onSearchClick(value) {
        console.log('called onSaerchClick');
        this.props.onSearchClick(value)
        this.refs.searchTextField.setState({ value: "" })
        this.setState({ opened: false })
    }

    // shouldComponentUpdate(nextProps, nextState) {
    //     return this.props.searchResults !== nextProps.searchResults
    //     || nextState.searchValue !== this.state.searchValue
    // }

    render() {
        const { searchResults } = this.props
        const { searchValue } = this.state

        console.log(this.state.opened, searchValue.length);

        return (
            <div className={this.props.className} style={{width: '100%'}}>
                <div style={styles.centerSearchField}>
                    <SearchTextField500
                        placeholder="Search"
                        debouncedOnChange={this.onChange}
                        onFocus={ (e) => { console.log('called onFocus'); this.setState({opened: true}) }}
                        ref="searchTextField"
                    />
                </div>
            {
                this.state.opened && searchValue.length !== 0 ?
                    <SearchList
                        searchValue={searchValue}
                        searchResults={searchResults}
                        onClick={this.onSearchClick}
                        outsideClickIgnoreClass='allSearch'
                        close={() => {console.log('called close'); this.setState({ opened: false })}}
                        searchlistClass={this.props.searchListClass}
                        
                    />
                    : null
            }
            </div>
        )
    }
}
Search.propTypes = {
    doSearch: PropTypes.func.isRequired, // perform a search
    searchResults: PropTypes.array.isRequired, // results returned from search
    onSearchClick: PropTypes.func.isRequired, // handle result
    className: PropTypes.string.isRequired, // class name for the main div
    searchlistClass: PropTypes.string.isRequired, // class name for the search list class
}

function mapStateToProps(state, props) {
    return {
        searchResults: state.allSearch
    }
}

export default Search
