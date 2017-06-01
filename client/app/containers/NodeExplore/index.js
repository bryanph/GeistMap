/*
 *
 * NodeExplore
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import NodeSearch from '../../containers/NodeSearch'
import Spinner from '../../components/Spinner'
import ForceGraph from '../../containers/ForceGraph'
import NodeToolbar from '../../containers/NodeToolbar'
import SwitchGraphView from '../../components/SwitchGraphView'

// TODO: don't store these calls in the store, becomes too heavy - 2016-07-15
const loadData = (props) => {
    if (props.id) {
        props.loadNodeL2(props.id)
            // .then(() => props.showGraphSideBar(props.id))
    }
}

import { accentColor } from '../App/muitheme.js'

export const NoNodesYet = (props) => (
    <div className="nodeExplore-noNodesYet">
        <span className="nodeExplore-noNodesYet-text">
            Search for a node to explore relations!<br/>
        </span>
        <NodeSearch 
            id={props.id}
            className="nodeExplore-nodeSearch"
            nodeSearchListClass="nodeExplore-nodeSearch-list"
            inputClass="nodeExplore-nodeSearch-input"
            onSearchClick={props.selectNode}
            placeholder={"Search..."}
        />
    </div>
)

export class NodeExplore extends React.Component { // eslint-disable-line react/prefer-stateless-function
    constructor(props) {

        super()
        this.selectNode = this.selectNode.bind(this)
        this.connectNodes = this.connectNodes.bind(this)
    }

    selectNode(ESNode) {
        const id = ESNode._id

        this.props.history.push(`/app/nodes/${id}`)
    }

    componentWillMount() {
        loadData(this.props)

        this.props.setTitle('Node Explore')
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id) {
            loadData(nextProps)
        }
    }

    connectNodes(from, to) {
        // TODO: temporarity until we get a better solution... - 2016-07-29

        this.props.connectNodes(from, to)
            .then(() => loadData(this.props))
    }

  render() {
      const { nodeView } = this.props
    return (
        <div className="graphView">
                {
                    this.props.id ? // TODO: check for is integer instead - 2016-10-07
                        <NodeToolbar page="nodes" />
                        : null
                }
                {
                    this.props.id ?  <SwitchGraphView /> : null
                }
            {
                this.props.id ? // instead check for loading state here...
                    <ForceGraph 
                        id={this.props.id}
                        nodes={this.props.nodes || []}
                        links={this.props.edges || []}
                        selectedId={this.props.node && this.props.node.id}
                        connectNodes2={this.connectNodes}
                        graphType={'explore'}
                    />
                    :
                    <NoNodesYet id={this.props.id} selectNode={this.selectNode} />
            }
            <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
                <div className="nodeBatchCreate-buttons">
                </div>
                { /*
                <NodeSearch
                    onSearchClick={this.selectNode}
                    placeholder={"Search a node to explore..."}
                />
                */ }
            </div>
        </div>
    );
  }
}

import { withRouter } from 'react-router-dom'

import { getNode, getL2Nodes, getL2Edges } from '../../reducers'

function mapStateToProps(state, props) {
    const id = props.match.params && props.match.params.id

    return {
        id: id,
        node: getNode(state, id),
        nodes: getL2Nodes(state, id),
        edges: getL2Edges(state, id),
        loadingStates: state.loadingStates,
        nodeView: state.uiState.nodeView,
    };
}

import { loadNodeL2, connectNodes } from '../../actions/async'
import { setTitle } from '../../actions/ui'

export default connect(mapStateToProps, {
    loadNodeL2,
    connectNodes,
    setTitle,
})(NodeExplore)
