/*
 *
 * NodeEditor
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'

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
        const { loadingStates } = this.props

        if (!this.props.node) {
            return <Spinner />
        }

        return (
            <div className='appContainer'>
                <NodeEditorToolbar
                    id={this.props.id}
                    collectionId={this.props.collectionId}
                    page={this.props.page}
                />
                <div className="contentContainer">
                    <div className="contentContainer-inner">
                        <ContentEditor
                            id={this.props.id} 
                            withToolbar={false}
                        />
                    </div>
                </div>
            </div>
        )
    }
}

import { getNode } from '../../reducers.js'

function mapStateToProps(state, props) {
    const id = props.id || (props.match.params && props.match.params.id)

    return {
        id,
        node: getNode(state, id),
        loadingStates: state.loadingStates,
    }
}

import { loadNodeL1 } from '../../actions/async'

export default connect(mapStateToProps, { loadNodeL1 })(NodeEditor);
