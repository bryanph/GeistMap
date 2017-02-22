
import _ from 'lodash'
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import { SearchTextField500 } from '../../components/Input/SearchTextField'
import { List, ListItem } from 'material-ui/List'
import { searchAll } from '../../actions/async'

import enhanceWithClickOutside from 'react-onclickoutside'

import { pure } from 'recompose'
import {HotKeys} from 'react-hotkeys';

// TODO: this can be factored out or the different Search components... - 2016-08-01
const AllSearchList = enhanceWithClickOutside(
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
AllSearchList.propTypes = {
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

class AllSearch extends React.Component {
    constructor(props) {
        super(props)

        this.onChange = this.onChange.bind(this)
        this.onSearchClick = this.onSearchClick.bind(this)

        this.searchAll = _.debounce(this.props.searchAll, 100).bind(this)

        this.state = {
            searchValue: "",
            opened: false,
        }
    }

    onChange(e) {
        this.setState({ searchValue: e.target.value })

        this.searchAll(e.target.value)
    }

    onSearchClick(value) {
        this.props.onSearchClick(value)
        this.setState({ searchValue: "", opened: false })
    }

    render() {
        const { searchResults } = this.props
        const { searchValue } = this.state

        const handlers = {
            'focusSearch': () => {
                this.refs.searchTextField.focus()
            }
        }

        return (
            <HotKeys focused={true} attach={document.getElementById('app')} handlers={handlers} className='allSearch' style={{width: '100%'}}>
                <div style={styles.centerSearchField}>
                    <SearchTextField500
                        placeholder="Search"
                        onChange={this.onChange}
                        onFocus={ (e) => { this.setState({opened: true}) }}
                        ref="searchTextField"
                        value={this.state.searchValue}
                    />
                </div>
            {
                this.state.opened && searchValue.length !== 0 ?
                    <AllSearchList
                        searchValue={searchValue}
                        searchResults={searchResults}
                        onClick={this.onSearchClick}
                        outsideClickIgnoreClass='allSearch'
                        close={() => {console.log('called close'); this.setState({ opened: false })}}
                    />
                    : null
            }
            </HotKeys>
        )
    }
}
AllSearch.propTypes = {
    searchResults: PropTypes.array.isRequired,
    onSearchClick: PropTypes.func,
}

function mapStateToProps(state, props) {
    return {
        searchResults: state.allSearch
    }
}

export default connect(mapStateToProps, { searchAll })(AllSearch)
