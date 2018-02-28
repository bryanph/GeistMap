import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import { drag as d3Drag } from 'd3-drag'
import { select as d3Select } from 'd3-selection'
import { event as currentEvent, mouse as currentMouse } from 'd3-selection';
import { scaleLinear } from 'd3-scale'
import { tree as d3Tree, hierarchy as d3Hierarchy } from 'd3-hierarchy'

import createZoom from '../zoom'
import {
    MIN_NODE_RADIUS,
    MAX_NODE_RADIUS,
    NODE_RADIUS,
    WIDTH,
    HEIGHT,
} from '../constants'

import ZoomButtons from '../ZoomButtons'

import './styles.scss'

import {
    colorNode,
    colorActiveNode,
} from '../colorNode'

import ContentAdd from 'material-ui/svg-icons/content/add-circle-outline'

import { dragElement } from '../../../actions/ui'

class HierarchyNode extends React.Component {
    constructor(props) {
        super(props)

        this.onFocusClick = this.onFocusClick.bind(this)
    }

    componentDidMount() {
        const selection = d3Select(`#node-${this.props.node.data.id}`)
        this.props.drag(selection)
    }

    onFocusClick() {
        return this.props.onFocusClick(this.props.node.data.id)
    }

    shouldComponentUpdate(nextProps) {
        const {
            node,
            draggedElement,
        } = nextProps


        return true;

        if (
            // we are dragging
            draggedElement.childrenMap[node.data.id] ||
            // the actual data has changed (doesn't influence position)
            // TODO: this won't work, instead will have to wrap the component - 2018-02-16
            node.data !== this.props.node.data
        ) {
            return true;
        }

        return false;
    }

    render() {
        const {
            node,
            onClick,
            draggedElement,
        } = this.props

        const x = draggedElement.childrenMap[node.data.id] ? (node.x + draggedElement.dx) : node.x;
        const y = draggedElement.childrenMap[node.data.id] ? (node.y + draggedElement.dy) : node.y;

        const transform = `translate(${y}, ${x})`;

        // const x = draggedElement.id === node.data.id ? draggedElement.dx : 0;
        // const y = draggedElement.id === node.data.id ? draggedElement.dy : 0;

        // const transform = `translate(${y}, ${x})`;

        const nodeClass = classNames({
            nodeActive: node.active
        }, 'node node-below')

        const hasAnchorLeft = !node.data.collections || node.data.collections.length === 0 || (node.children && node.children.length === 0)

        return (
            <g
                id={`node-${node.data.id}`}
                className={ nodeClass }
                transform={transform}
            >
                <circle
                    className="nodeCircle"
                    r={node.radius}
                    onClick={() => onClick(node.data.id)}
                    onContextMenu={(e) => this.props.onContextMenu(e, node.data.id)}
                />
                <text 
                    className="nodeFocus"
                    x={ node.radius + 4 }
                    onClick={ this.onFocusClick }
                >{ '\u23FA' }</text>
                <text
                    className="nodeText"
                    x={hasAnchorLeft ? -node.radius-8 : (node.radius + 19)}
                    textAnchor={ hasAnchorLeft ? "end" : "start" }
                >{node.data.name}</text>
            </g>
        )
    }
}
HierarchyNode = connect(
    (state) => ({ draggedElement: state.graphUiState.draggedElement }),
    { dragElement }
)(HierarchyNode)

class HierarchyLink extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { link, draggedElement } = this.props

        // hide if dragging the node
        if (draggedElement.id === link.data.id) {
            return null;
        }

        const x = draggedElement.childrenMap[link.data.id] ? draggedElement.dx : 0;
        const y = draggedElement.childrenMap[link.data.id] ? draggedElement.dy : 0;

        const transform = `translate(${y}, ${x})`;

        return (
            <path 
                transform={transform}
                className="hierarchy-link"
                d={ 
                    [
                        "M",
                        link.y,
                        link.x,
                        "C",
                        (link.y + link.parent.y) / 2,
                        link.x,
                        (link.y + link.parent.y) / 2,
                        link.parent.x,
                        link.parent.y,
                        link.parent.x
                    ].join(' ')
                }
            />
        )
    }
}
HierarchyLink = connect(
    (state) => ({ draggedElement: state.graphUiState.draggedElement }),
    { dragElement }
)(HierarchyLink)

class NodeHierarchy extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const selection = d3Select(`#node-${this.props.node.data.id}`)
        this.props.drag(selection)
    }

    render() {
        const { node, draggedElement } = this.props

        const x = draggedElement.id === node.data.id ? draggedElement.dx : 0;
        const y = draggedElement.id === node.data.id ? draggedElement.dy : 0;

        const transform = `translate(${y}, ${x})`;

        return (
            <g 
                id={`node-${node.data.id}`}
                className="node-inside"
                transform={transform}
            >
                {
                    (node.children || []).map(link => (
                        <HierarchyLink
                            key={link.data.id}
                            link={link}
                        />
                    ))
                }
                <HierarchyNode 
                    key={node.data.id}
                    node={node}
                    onClick={this.props.onNodeClick}
                    onFocusClick={this.props.onNodeFocus}
                    showAddNodeWindow={this.props.showAddNodeWindow}
                    drag={this.props.drag}
                    onContextMenu={this.props.onNodeContextMenu}
                />
                { (node.children || []).map((node) => (
                    <NodeHierarchy {...this.props} key={node.data.id} node={ node } />
                )) }
            </g>
            
        )
    }
}
NodeHierarchy = connect(
    (state) => ({ draggedElement: state.graphUiState.draggedElement }),
    { dragElement }
)(NodeHierarchy)

class NodeGraph extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const {
            treeData,
            nodes,
            links,
            hierarchyLinks,
            showLinks,
            nodesAboveAbstraction,
        } = this.props

        let nodesById = {}
        nodes.forEach(node => {
            nodesById[node.data.id] = node
        })

        links.forEach(link => {
            link.source = nodesById[link.start]
            link.target = nodesById[link.end]
        })

        // const maxLabelLength = 50;
        // // Set widths between levels based on maxLabelLength.
        // nodes.forEach(function(d) {
        //     d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
        // });

        const nodeElements = nodes.map(node => (
            <HierarchyNode 
                key={node.data.id}
                node={node}
                onClick={this.props.onNodeClick}
                onFocusClick={this.props.onNodeFocus}
                showAddNodeWindow={this.props.showAddNodeWindow}
                drag={this.props.drag}
                onContextMenu={this.props.onNodeContextMenu}
            />
        ))

        const hierarchyLinkElements = hierarchyLinks.map(link => (
            <HierarchyLink
                key={link.data.id}
                link={link}
            />
        ))

//         const linkElements = links
//             .filter(link => (
//                 !(
//                     link.source.data.id === ((link.target.parent) && link.target.parent.data.id)
//                     ||
//                     link.target.data.id === ((link.source.parent) && link.source.parent.data.id)
//                 )
//             ))
//             .map(link => (
//             <Link
//                 key={link.id}
//                 link={link}
//             />
//         ))

        // const hierarchyElements = nestedGroupings(this.props.treeData)
        // const hierarchyElements = (
        //     <NodeHierarchy
        //         node={this.props.treeData} 
        //         drag={this.props.drag}
        //         showAddNodeWindow={this.props.showAddNodeWindow}
        //         onNodeClick={this.props.onNodeClick}
        //         onNodeFocus={this.props.onNodeFocus}
        //         onNodeContextMenu={this.props.onNodeContextMenu}
        //     />
        // )

//         const nodeAboveElements = nodesAboveAbstraction.map(node => (
//             <HierarchyNode
//                 key={node.data.id}
//                 node={node}
//                 drag={this.props.drag}
//                 showAddNodeWindow={this.props.showAddNodeWindow}
//                 onClick={this.props.onNodeClick}
//                 onFocusClick={this.props.onNodeFocus}
//                 onContextMenu={this.props.onNodeContextMenu}
//             />
//         ))

//         const linkAboveElements = nodesAboveAbstraction.map(node => (
//             <HierarchyLink
//                 key={node.data.id}
//                 link={{
//                     x: 0,
//                     y: 0,
//                     data: {
//                         ...this.props.focusNode
//                     },
//                     parent: node
//                 }}
//             />
//         ))

        return (
            <g className="hierarchy-graph">
                { hierarchyLinkElements }
                { nodeElements }
                { /* showLinks ? linkElements : null */ }
                { /* hierarchyElements */ }
            </g>
        )
    }
}

export default withRouter(NodeGraph)
