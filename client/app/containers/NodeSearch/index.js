import _ from 'lodash'
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import { SearchTextField500 } from '../../components/Input/SearchTextField'
import { DebouncedTextField500 } from '../../components/Input'
import { List, ListItem } from 'material-ui/List'
import { searchNode } from '../../actions/async'

import enhanceWithClickOutside from 'react-onclickoutside'

import './styles.css'

const NodeSearchList = enhanceWithClickOutside(
class extends React.Component {
    constructor(props) {
        super(props)

        this.handleClickOutside = this.handleClickOutside.bind(this)
        this.onClick = this.onClick.bind(this)

    }

    handleClickOutside() {
        this.props.close()
    }

    onClick(result) {
        this.props.onClick(result)
    }

    render() {
        const { searchResults, searchValue } = this.props

        const listItems = _(searchResults)
            .filter(res => res._id !== this.props.id)
            .map(result => (
                <ListItem 
                    onTouchTap={() => this.onClick(result)}
                    primaryText={result._source.title}
                />
            ))
            .value()

        return (
            <div className={this.props.className || 'nodeSearch-list'}>
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
NodeSearchList.propTypes = {
    searchResults: PropTypes.array.isRequired,
}

class NodeSearch extends React.Component {
    constructor(props) {
        super(props)

        this.onChange = this.onChange.bind(this)
        this.onSearchClick = this.onSearchClick.bind(this)

        this.searchNode = _.debounce(this.props.searchNode, 100).bind(this)

        this.state = {
            searchValue: this.props.initialValue || "",
            opened: false,
        }

        if (this.props.initialValue) {
            this.props.searchNode(this.props.initialValue)
        }
    }

    onSearchClick(value) {
        this.props.onSearchClick(value)
        this.refs.searchTextField.setState({ value: "" })
        this.setState({ opened: false })
    }

    onChange(e) {
        this.setState({ searchValue: e.target.value })

        this.searchNode(e.target.value)
    }

    render() {
        const { searchResults } = this.props
        const { searchValue } = this.state

        return (
            <div className={this.props.className || "nodeSearch"}>
                    { /* autoFocus */ }
                <SearchTextField500
                    className={this.props.inputClass || "searchTextField-input" }
                    placeholder={ this.props.placeholder || "Search for a node..."}
                    onChange={this.onChange}
                    onFocus={ (e) => { this.setState({opened: true}) }}
                    autoFocus
                    ref="searchTextField"
                    value={this.state.searchValue}
                />
            {
                this.state.opened && searchValue.length !== 0 ?
                    <NodeSearchList
                        id={this.props.id}
                        searchValue={this.state.searchValue}
                        searchResults={searchResults}
                        onClick={this.onSearchClick}
                        className={this.props.nodeSearchListClass}
                        outsideClickIgnoreClass={this.props.className || "nodeSearch"}
                        close={() => { this.setState({ opened: false })}}
                    />
                : null
            }
            </div>
        )
    }
}
NodeSearch.propTypes = {
    searchResults: PropTypes.array.isRequired,
    onSearchClick: PropTypes.func,

    className: PropTypes.object,
    nodeSearchListClass: PropTypes.string,
}

function mapStateToProps(state, props) {
    return {
        searchResults: state.nodeSearch
    }
}

export default connect(mapStateToProps, { searchNode })(NodeSearch)
