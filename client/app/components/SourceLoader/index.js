import React, { Component } from 'react'
import { connect } from "react-redux"
import Spinner from '../Spinner'

import {
    isLoadingDetail,
    hasLoadedDetail,
    getSource,
    getHighlightsBySourceId,
} from "../../reducers/source"

import { fetchSource } from '../../actions/source'

class SourceLoader extends React.Component {
    constructor(props) {
        super(props)
    }

    loadData = (props) => {
        props.fetchSource(props.id)
    }

    componentDidMount() {
        this.loadData(this.props)
    }

    componentDidUpdate(prevProps) {
        if (prevProps.id !== this.props.id) {
            this.loadData(this.props)
        }
    }

    render() {
        const { children, hasLoaded, source, highlights } = this.props;

        console.log(hasLoaded, highlights)

        if (hasLoaded) {
            return children(source, highlights)
        }

        // TODO: handle source not existing - 2018-05-01

        return <Spinner />
    }
}

function mapStateToProps(state, props) {
    return {
        hasLoaded: hasLoadedDetail(state),
        isLoading: isLoadingDetail(state),
        source: getSource(state, props.id),
        highlights: getHighlightsBySourceId(state, props.id),
    }
}

export default connect(mapStateToProps, {
    isLoadingDetail,
    hasLoadedDetail,
    getSource,
    getHighlightsBySourceId,
    fetchSource,
})(SourceLoader)
