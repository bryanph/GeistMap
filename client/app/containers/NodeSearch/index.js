import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'

import { List, ListItem } from 'material-ui/List'
import { searchAll } from '../../actions/search'

import {HotKeys} from 'react-hotkeys';

import './styles.scss'

import compose from 'recompose/compose'

class NodeSearchList extends React.Component {
    constructor(props) {
        super(props)

        this.onClick = this.onClick.bind(this)
    }

    onClick(result) {
        this.props.onClick(result)
    }

    render() {
        const { searchResults, searchValue } = this.props

        console.log(searchResults)

        const listItems = _.map(searchResults, result => (
            <ListItem
                key={result._id}
                onClick={() => this.onClick(result)}
                primaryText={result._source.title || result._source.name}
                secondaryText={"Node"}
            />
        ))

        if (searchValue.length === 0 || searchResults.length === 0){
            return null
        }

        return (
            <div className='nodeSearch-list'>
                <List>
                    {listItems}
                </List>
            </div>
        )
    }
}

import { Input } from 'semantic-ui-react'
import { Button, Icon } from 'semantic-ui-react'

class SearchInput extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        setTimeout(this.input.focus, 0)
    }

    render() {
        const {
            onClick,
            ...restProps
        } = this.props

        return (
            <Input
                size='large'
                action={<Button content="Create" onClick={this.props.onClick} />}
                placeholder="Label"
                className="nodeSearch-input"
                ref={(input) => this.input = input}
                {...restProps}
            />
        )
    }
}

import { ResponsiveButton } from '../../components/button'
// only rendered on mobile
const SearchInputButton = (props) => (
    <ResponsiveButton iconName="search" name="search" className="nodeSearch-inputButton" />
)


class NodeSearch extends React.Component {
    constructor(props) {
        super(props)

        this.onChange = this.onChange.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
        this.onKeyPress = this.onKeyPress.bind(this)
        this.onSearchClick = this.onSearchClick.bind(this)

        this.searchAll = _.debounce(this.props.searchAll, 100).bind(this)

        this.state = {
            searchValue: props.initialValue || "",
            opened: false,
        }

        if (props.initialValue) {
            this.searchAll(props.initialValue)
        }
    }

    onChange(e) {
        this.setState({ searchValue: e.target.value })

        this.searchAll(e.target.value)
    }

    onKeyPress(e) {
        const { onEnter } = this.props
        if (e.key === 'Enter') {
            if (onEnter) {
                onEnter(this.state.searchValue)
                this.setState({ searchValue: "" })
            }
        }
    }

    onSubmit() {
        this.props.onClick(this.state.searchValue)
        this.setState({ searchValue: "" })
    }

    onSearchClick(value) {
        this.props.onSearchClick(value)
        this.setState({ searchValue: "", opened: false })
    }

    render() {
        const { intialValue, searchResults } = this.props
        const { searchValue } = this.state

        return (
            <div className="nodeSearch">
                <SearchInput
                    onChange={this.onChange}
                    onKeyPress={this.onKeyPress}
                    onClick={this.onSubmit}
                    onFocus={ (e) => { this.setState({opened: true}) }}
                    value={searchValue}
                    disabled={this.props.disabled}
                />
                <NodeSearchList
                    searchValue={searchValue}
                    searchResults={searchResults}
                    onClick={this.onSearchClick}
                />
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {
        searchResults: state.allSearch
    }
}

export default connect(mapStateToProps, { searchAll })(NodeSearch)
