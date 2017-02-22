/*
 *
 * NodeEditor
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router'

import NodeEditorToolbar from '../../containers/NodeEditorToolbar'
import ContentEditor from '../../containers/NodeContentEditor'
import Spinner from '../../components/Spinner'

import './styles.css'

class NodeEditor extends React.Component {

    componentWillMount() {
        this.props.loadNodeL1(this.props.id)
    }

    componentWillReceiveProps(nextProps) {
        // TODO: set active node if id is set - 2016-10-05
        if (nextProps.id && this.props.id !== nextProps.id) {
            this.props.loadNodeL1(nextProps.id)
        }
    }

    render() {
        const { loadingStates, shortcutWindow } = this.props

        if (!this.props.node) {
            return <Spinner />
        }

        return (
            <div className='graphView'>
                <NodeEditorToolbar 
                    id={this.props.id}
                    collectionId={this.props.collectionId}
                    page={this.props.page}
                />
                <ContentEditor 
                    id={this.props.id} 
                    withToolbar={false}
                    shortcutWindow={shortcutWindow}
                />
            </div>
        )
    }
}

import { getNode } from '../../reducers.js'

function mapStateToProps(state, props) {
    const id = (props.params && props.params.id) || props.id

    return {
        id,
        node: getNode(state, id),
        loadingStates: state.loadingStates,
        shortcutWindow: state.serverUiState.shortcutWindow,
    }
}

import { loadNodeL1 } from '../../actions/async'

export default connect(mapStateToProps, { loadNodeL1 })(NodeEditor);
