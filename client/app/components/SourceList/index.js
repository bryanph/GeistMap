import React, { Component } from 'react'

import Spinner from '../Spinner'

import { connect } from "react-redux"
import {
    isLoadingList,
    hasLoadedList,
    getSources,
} from "../../reducers/source"
import { fetchSources } from '../../actions/source'

import "./styles.scss"

class SourceListLoader extends React.Component {
    constructor(props) {
        super(props)
    }

    loadData = (props) => {
        props.fetchSources()
    }

    fetchMore = () => {
        // TODO: also handle pagination and such - 2018-04-30

    }

    componentDidMount() {
        this.loadData(this.props)
    }

    render() {
        const { children, hasLoaded, sources } = this.props;

        if (hasLoaded) {
            return children(sources)
        }

        return <Spinner />
    }
}

function mapStateToProps(state) {
    return {
        hasLoaded: hasLoadedList(state),
        isLoading: isLoadingList(state),
        sources: getSources(state),
    }
}

SourceListLoader = connect(mapStateToProps, {
    isLoadingList,
    hasLoadedList,
    getSources,
    fetchSources,
})(SourceListLoader)


class SourceGridItem extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const {  } = this.props

        return (
            <div className="SourceGrid-item">

            </div>
        )
    }
}

class SourceGridPlaceholder extends React.Component {
    /*
     * For adding a new source
     * User can either
     * 1. click to add a new source (a popup)
     * 2. drag a source to the grid area to upload it
     *
     *
    */
    constructor(props) {
        super(props)
    }

    onDragItem = () => {
        // TODO: Let user choose between hosting local or uploading it - 2018-04-30
    }


    render() {
        const {  } = this.props

        return (
            <div className="SourceGrid-item">
                <i className="fa fa-plus" />

            </div>
        )
    }
}

class SourceGrid extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { sources } = this.props

        return (
            <div className="SourceGrid">
                {
                    sources.map(source => <SourceGridItem source={source} />)
                }
                <SourceGridPlaceholder />
            </div>
        )
    }
}

class SourceListView extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <SourceListLoader>
                { sources => (
                    <SourceGrid sources={sources} />
                )}
            </SourceListLoader>
        )
    }
}

export default SourceListView
