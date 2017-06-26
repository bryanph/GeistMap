/*
 *
 * NodeExplore
 *
 */

import React from 'react';
import { connect } from 'react-redux';

import NodeSearch from '../../containers/NodeSearch'
import Spinner from '../../components/Spinner'
import NodeGraph from '../../components/NodeGraph'
import EditModeButton from '../../components/EditModeButton'
import FocusButton from '../../components/FocusButton'
import FetchNodeButton from '../../components/FetchNodeButton'

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
        const { loadingStates } = this.props

        if (loadingStates.GET_NODE_L2) {
            return <Spinner />
        }
        return (
            <div className="appContainer">
                    <NodeGraph 
                        id={this.props.id}
                        nodes={this.props.nodes || []}
                        links={this.props.edges || []}
                        selectedId={this.props.node && this.props.node.id}
                        connectNodes2={this.connectNodes}
                        graphType={'explore'}
                    />
                <div className="graphActions">
                    <FocusButton />
                    <FetchNodeButton />
                </div>
                <div className="editModeButton-container">
                    <EditModeButton />
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
    };
}

import { loadNodeL2, connectNodes } from '../../actions/async'

export default connect(mapStateToProps, {
    loadNodeL2,
    connectNodes,
})(NodeExplore)
