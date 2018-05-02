import React, { Component } from 'react'
import { connect } from "react-redux"

import "./styles.scss"


import {
    addSource,
    updateSource,
    removeSource,
} from '../../actions/source'

import SourcesLoader from '../SourcesLoader'
import SourceGridItem from '../SourceGridItem'
import SourceGridPlaceholder from '../SourceGridPlaceholder'

class SourceGrid extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { sources } = this.props

        return (
            <div className="SourceGrid">
                <SourceGridPlaceholder
                    addSource={this.props.addSource}
                />
                {
                    sources.map(source =>
                        <SourceGridItem
                            key={source.id}
                            source={source}
                            updateSource={this.props.updateSource}
                            removeSource={this.props.removeSource}
                        />)
                }
            </div>
        )
    }
}

class SourceGridView extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <SourcesLoader>
                { sources => (
                    <SourceGrid 
                        sources={sources} 
                        addSource={this.props.addSource}
                        updateSource={this.props.updateSource}
                        removeSource={this.props.removeSource}
                    />
                )}
            </SourcesLoader>
        )
    }
}

export default connect(null, {
    addSource,
    updateSource,
    removeSource,
})(SourceGridView)
