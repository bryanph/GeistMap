

import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import classNames from 'classnames'

import d3 from 'd3'

import { getNode, getBatchNodes, getEdgesForNodes } from '../../reducers.js'

import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

import SavedState from '../../containers/SavedState'
import Spinner from '../../components/Spinner'

import './styles.css'

import MainFocus from '../../containers/MainFocus'

import NodeBatchCreateGraph from '../../containers/NodeBatchCreateGraph'
import NodeBatchCreateEditor from '../../containers/NodeBatchCreateEditor'


class BatchCreateGraphContainer extends React.Component {

    render() {
        const { nodes, links, loadingStates } = this.props

        if (loadingStates.GET_ALL_BATCH_NODES) {
            return <Spinner />
        }

        return (
            <MainFocus
                left={
                    <NodeBatchCreateEditor
                        id={this.props.id}
                    />
                }
                right={
                    <NodeBatchCreateGraph
                        id={this.props.id}
                    />
                }
            />
        )
    }
}
BatchCreateGraphContainer.propTypes = {
    nodes: PropTypes.arrayOf(PropTypes.object).isRequired,
    links: PropTypes.arrayOf(PropTypes.object).isRequired,
    connectNodes: PropTypes.func.isRequired,
}

function mapStateToProps(state, props) {
    const { id } = props.params

    console.log('called mapStateToProps...');

    return {
        id,
        uiState: state.uiState,
        loadingStates: state.loadingStates,
    }
}

import { loadNode, connectNodes, createBatchNode, updateNode, removeNode, removeEdge, getAllBatchNodes, clearBatchNodes } from '../../actions/async'
import { showGraphSideBar, hideGraphSideBar, setTitle, changeMainFocus } from '../../actions/ui'

export default connect(mapStateToProps, {
    connectNodes,
    createBatchNode,
    updateNode,
    removeNode,
    removeEdge,
    loadNode,
    getAllBatchNodes,
    clearBatchNodes,
    showGraphSideBar,
    hideGraphSideBar,
    setTitle,
    changeMainFocus
})(withRouter(BatchCreateGraphContainer))
