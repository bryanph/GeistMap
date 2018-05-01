import React, { Component } from 'react'
import { connect } from "react-redux"
import Spinner from '../Spinner'

import {
    isLoadingList,
    hasLoadedList,
    getSources,
} from "../../reducers/source"

import { fetchSources } from '../../actions/source'

class SourcesLoader extends React.Component {
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

export default connect(mapStateToProps, {
    isLoadingList,
    hasLoadedList,
    getSources,
    fetchSources,
})(SourcesLoader)
