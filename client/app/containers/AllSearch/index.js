
import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'

import { List, ListItem } from 'material-ui/List'
import { searchAll } from '../../actions/search'

import {HotKeys} from 'react-hotkeys';
import Portal from 'react-portal'

import './styles.scss'

// TODO: this can be factored out or the different Search components... - 2016-08-01
class AllSearchList extends React.Component {
    constructor(props) {
        super(props)

        this.onClick = this.onClick.bind(this)
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
                secondaryText={"Node"}
            />
        ))

        let content = null
        if (searchValue.length === 0){
            content = <span className="allSearch-no-result">Try a search term</span>
        }
        else if (searchResults.length === 0) {
            content = <span className="allSearch-no-result">No results. Try another search term</span>
        }
        else {
            content = (
                <List>
                    { listItems }
                </List>
            )

        }

        return (
            <div className='allSearch-list'>
                { content }
            </div>
            
        )
    }
}

import { Input } from 'semantic-ui-react'
import { Button, Icon } from 'semantic-ui-react'

// only rendered on desktop
const SearchInput = (props) => (
    <Input icon='search' size='small' placeholder='Search...' className="allSearch-input" {...props} />
)

import { ResponsiveButton } from '../../components/button'
// only rendered on mobile
const SearchInputButton = (props) => (
    <ResponsiveButton iconName="search" name="search" className="allSearch-inputButton" />
)


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
                // this.refs.searchTextField.focus()
            }
        }

        const input = (
                <SearchInput 
                    onChange={this.onChange}
                    onFocus={ (e) => { this.setState({opened: true}) }}
                    value={this.state.searchValue}
                />
        )

        return (
            <HotKeys focused={true} attach={document.getElementById('root')} handlers={handlers} className='allSearch'>
                <SearchInputButton />
                <Portal closeOnEsc closeOnOutsideClick openByClickOn={input}>
                    <AllSearchList
                        searchValue={searchValue}
                        searchResults={searchResults}
                        onClick={this.onSearchClick}
                    />
                </Portal>
            </HotKeys>
        )
    }
}

function mapStateToProps(state, props) {
    return {
        searchResults: state.allSearch
    }
}

export default connect(mapStateToProps, { searchAll })(AllSearch)
