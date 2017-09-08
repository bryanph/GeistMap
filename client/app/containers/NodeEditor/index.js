/*
 *
 * NodeEditor
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'

import NodeEditorToolbar from '../../containers/NodeEditorToolbar'
import ContentEditor from '../../containers/NodeContentEditor'
import Spinner from '../../components/Spinner'

import './styles.css'

class NodeEditor extends React.Component {

    componentWillMount() {
        this.props.loadNodeL1(this.props.nodeId)
    }

    componentWillReceiveProps(nextProps) {
        // TODO: set active node if id is set - 2016-10-05
        if (nextProps.nodeId && this.props.nodeId !== nextProps.nodeId) {
            this.props.loadNodeL1(nextProps.nodeId)
        }
    }

    render() {
        const { loadingStates } = this.props

        if (!this.props.node) {
            return <Spinner />
        }

        console.log(this.props.nodeId)

        return (
            <div className='appContainer'>
                <div className="contentContainer">
                    <div className="contentContainer-inner">
                        <ContentEditor
                            id={this.props.nodeId} 
                            withToolbar={false}
                        />
                    </div>
                </div>
            </div>
        )
    }
}

import { getNode } from '../../reducers'

function mapStateToProps(state, props) {
    return {
        node: getNode(state, id),
        loadingStates: state.loadingStates,
    }
}

import { loadNodeL1 } from '../../actions/node'

export default connect(mapStateToProps, { loadNodeL1 })(NodeEditor);
