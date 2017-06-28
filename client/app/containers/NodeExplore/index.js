import React from 'react';
import { connect } from 'react-redux';

import {
    loadNodeL1,
    connectNodes,
    updateNode
} from '../../actions/async'

import {
    addNode,
    setActiveNode,
} from '../../actions/ui'

import NodeView from '../NodeView'

const loadData = (props) => {
    props.loadNodeL1(props.id)
}

import { accentColor } from '../App/muitheme.js'

export class NodeExplore extends React.Component { // eslint-disable-line react/prefer-stateless-function
    constructor(props) {
        super(props)
        this.connectNodes = this.connectNodes.bind(this)
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
        const {
            collection,
            nodes,
            links,
            loadingStates,
            focus,
            mode,
        } = this.props


        return (
            <NodeView 
                graphType={"node"}
                isLoading={loadingStates.GET_NODE_L2}
                nodes={nodes}
                links={links}
                mode={mode}
                focus={focus}

                addNode={this.props.addNode}
                connectNodes={this.connectNodes}
                updateNode={this.props.updateNode}
                setActiveNode={this.props.setActiveNode}
            />
        );
    }
}


import {
    getL1Nodes,
    getL1Edges
} from '../../reducers'

function mapStateToProps(state, props) {
    const id = props.match.params && props.match.params.id

    return {
        id: id,
        mode: state.graphUiState.mode,
        focus: state.graphUiState.focus,
        nodes: getL1Nodes(state, id),
        edges: getL1Edges(state, id),
        loadingStates: state.loadingStates,
    };
}

export default connect(mapStateToProps, {
    loadNodeL1,
    addNode,
    connectNodes,
    updateNode,
    setActiveNode,
})(NodeExplore)
