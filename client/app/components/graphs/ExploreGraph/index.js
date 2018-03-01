
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

import {
    forceSimulation,
    forceX,
    forceY,
    forceManyBody,
    forceLink,
    forceCenter
} from 'd3-force'

import createZoom from '../zoom'
import {
    MIN_NODE_RADIUS,
    MAX_NODE_RADIUS,
    NODE_RADIUS,
    WIDTH,
    HEIGHT,
} from '../constants'

import ZoomButtons from '../ZoomButtons'

import HierarchyGraph from '../HierarchyGraph'
import {
    createInnerDrag
} from './drag'

import { dragElement, showAddNodeWindow } from '../../../actions/ui'

import './styles.scss'

import ToggleShowLinks from '../../ToggleShowLinks'
import WrapText from '../WrapText'
import { getTextSize } from '../scales'

class NodeOutside extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const selection = d3Select(`#node-${this.props.node.data.id}`)
        this.props.drag(selection)
    }

    render() {
        const { node, draggedElement } = this.props

        const x = draggedElement.id === node.data.id ? draggedElement.x : node.x;
        const y = draggedElement.id === node.data.id ? draggedElement.y : node.y;

        // this is swapped because it is a vertical tree
        const transform = `translate(${y}, ${x})`;

        return (
            <g
                id={`node-${node.data.id}`}
                className="node node-outside"
                transform={transform}
                onClick={() => this.props.onClick(node.data.id)}
            >
                <circle
                    className="nodeCircle"
                    r={node.radius}
                    fill={ node.children ? "lightsteelblue" : "#fff" }
                    onContextMenu={(e) => this.props.onContextMenu(e, node.data.id)}
                />
                <WrapText
                    style={{ fontSize: `${getTextSize(node.data.name.length)}em` }}
                    className="nodeText"
                    x={node.children ? -node.radius-8 : node.radius + 8}
                    y={0}
                    width={142}
                    textAnchor={ node.children ? "end" : "start" }
                    verticalAlign={"center"}
                >{node.data.name}</WrapText>
            </g>
        )
    }
}
NodeOutside = connect(
    (state) => ({ draggedElement: state.graphUiState.draggedElement }),
    { dragElement }
)(NodeOutside)


class NodeAbove extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { node } = this.props

        // this is swapped because it is a vertical tree
        const transform = `translate(${node.y}, ${node.x})`;

        return (
            <g
                id={`node-${node.data.id}`}
                className="node node-above"
                transform={transform}
                onClick={() => this.props.onClick(node.data.id)}
            >
                <circle
                    className="nodeCircle"
                    r={node.radius}
                    onContextMenu={(e) => this.props.onContextMenu(e, node.data.id)}
                />
                <WrapText
                    style={{ fontSize: `${getTextSize(node.data.name.length)}em` }}
                    className="nodeText"
                    x={-node.radius-8}
                    y={0}
                    width={142}
                    textAnchor={ "end" }
                    verticalAlign={"center"}
                >{node.data.name}</WrapText>
            </g>
        )
    }
}

class LinkAbove extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { link } = this.props

        return (
            <path 
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

class LinkOutside extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { link, draggedElement } = this.props

        // for moving with dragged element
        const sourceX = draggedElement.id === link.source.data.id ? draggedElement.x : link.source.x;
        const sourceY = draggedElement.id === link.source.data.id ? draggedElement.y : link.source.y;
        const targetX = draggedElement.id === link.target.data.id ? draggedElement.x : link.target.x;
        const targetY = draggedElement.id === link.target.data.id ? draggedElement.y : link.target.y;

        const startingPoint = `M ${sourceY}, ${sourceX}`

        const path = link.source.depth === link.target.depth ? 
            [ startingPoint,
                'A',
                (sourceX - targetX) / 2,
                // 50,
                (sourceX - targetX) / 2,
                0,
                0,
                sourceX < targetX ? 1 : 0,
                targetY,
                targetX
            ].join(' ')
            :
            // [
            //     startingPoint,
            //     'L',
            //     targetY,
            //     targetX
            // ].join(' ')
            [
                startingPoint,
                "C",
                (sourceY + targetY) / 2,
                sourceX,
                (sourceY + targetY) / 2,
                targetX,
                targetY,
                targetX
            ].join(' ')

        return (
            <path 
                className="link"
                d={ path }
            />
        )
    }
}
LinkOutside = connect(
    (state) => ({ draggedElement: state.graphUiState.draggedElement }),
    { dragElement }
)(LinkOutside)


class ManipulationLayer extends React.Component {
    constructor(props) {
        super(props)

        this.zoomed = this.zoomed.bind(this)

        this.state = {
            containerTransform: `translate(${WIDTH/2}, ${HEIGHT/2})`
        }
    }

    componentDidMount() {
        const domNode = ReactDOM.findDOMNode(this.refs.graph)
        this.graph = d3Select(domNode);
        this.container = d3Select(ReactDOM.findDOMNode(this.refs.container));

        this.zoom = createZoom(this.graph, this.container, WIDTH, HEIGHT, this.zoomed)

        this.zoom.zoomFit(false)
    }

    componentDidUpdate() {
        this.zoom.zoomFit()
    }

    zoomed(transform) {
        this.setState({
            containerTransform: transform
        })
    }

    render() {
        return (
            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                preserveAspectRatio="xMidYMid meet"
                className="svg-content explore-graph"
                ref="graph"
            >
                <g ref="container" transform={this.state.containerTransform}>
                    { this.props.children }
                </g>
            </svg>
        )
    }
}

const iterations = 500;
const edgeStrength = 0.4;
const distanceMax = Infinity;

class ExploreGraph extends React.Component {

    constructor(props) {
        super(props)

        this.onNodeClick = this.onNodeClick.bind(this);
        this.onNodeFocus = this.onNodeFocus.bind(this);
        this.closeContextMenu = this.closeContextMenu.bind(this);
        this.openContextMenu = this.openContextMenu.bind(this);

        this.simulation = forceSimulation()
            .velocityDecay(0.6)
            .force(
                "charge", 
                forceManyBody()
                .distanceMax(distanceMax)
                .strength(-500)
                // .strength(-25 * nodeSizeAccessor(d))
            )
            .force("x", forceX().strength(-0.02))
            .force("y", forceY().strength(-0.02))
        // .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
            .force("link",
                forceLink()
                .id(d => d.id)
                // .distance(d => 50 + d.source.radius + d.target.radius)
                .distance(d => 200)
                .strength(
                    d => (d.weight ? d.weight * edgeStrength : edgeStrength)
                )
            )

        this.simulation.stop()

        const innerDragEvents = createInnerDrag(this)({
            // connect: onConnect,
            moveToAbstraction: this.props.moveToAbstraction,
        })

        this.drag = d3Drag()
            .on('drag', innerDragEvents.drag)
            .on('start', innerDragEvents.dragstart)
            .on('end', innerDragEvents.dragend)

        this.state = {
            // the id of the node that is active in the contextMenu
            contextMenu: {
                opened: false,
                nodeId: null,
                currentEvent: null,
            }
        }
    }

    closeContextMenu() {
        this.setState({ 
            contextMenu: {
                opened: false,
            }
        })
    }

    openContextMenu(e, id) {
        e.preventDefault();
        e.persist();

        if (id === this.props.focusNodeId) {
            return;
        }

        this.setState({ 
            contextMenu: {
                opened: true,
                nodeId: id,
                currentEvent: e,
            }
        })
    }

    removeNode(id) {
        const node = this.nodesById[id];

        const result = window.confirm(`Are you sure you want to delete "${node.data.name}"`)
        if (result) {
            this.props.removeNode(id)
        }

    }

    removeNodeFromCollection(id) {
        const node = this.nodesById[id];

        if (!node.parent) {
            return;
        }
        const result = window.confirm(`Are you sure you want to remove "${node.data.name}" from "${node.parent.data.name}"'`)
        if (result) {
            this.props.removeNodeFromCollection(node.parent.data.id, id)
        }

    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.isLoading) {
            return false;
        }

        return true;
    }


    onNodeClick(id) {
        return this.props.history.push({
            pathname: `/app/nodes/${id}/graph`,
            search: this.props.location.search
        })
    }

    onNodeFocus(id) {
        return this.props.history.push({
            pathname: `/app/nodes/${this.props.focusNodeId}/graph/${id}`,
            search: this.props.location.search
        })
    }

    render() {
        // TODO: set the nodes and links here instead of in the graph - 2018-01-29

        const {
            // nodesBelowAbstraction,
            edgesBelowAbstraction,
            nodesWithAbstraction, // nodes both in and outside the abstraction
            edgesOutsideAbstraction,
            nodeTree,
            showLinks,
            focusNode,
        } = this.props

        let {
            nodesOutsideAbstraction,
            nodesAboveAbstraction,
        } = this.props

        const TREE_NODE_HEIGHT = 200;
        const TREE_NODE_WIDTH = 40;

        const tree = d3Tree()
        tree.nodeSize([TREE_NODE_WIDTH, TREE_NODE_HEIGHT])
        const treeData = tree(d3Hierarchy(nodeTree))

        const nodesBelowAbstraction = treeData.descendants()
        // make sure the data is under a data key
        nodesOutsideAbstraction = nodesOutsideAbstraction.map(node => ({ data: { ...node } }))
        nodesAboveAbstraction = nodesAboveAbstraction.map(node => ({ data: { ...node } }))

        const hierarchyLinks = nodesBelowAbstraction.slice(1)

        let nodesById = {}

        // the parent nodes
        let totalParentHeight = TREE_NODE_WIDTH * (nodesAboveAbstraction.length-1)
        nodesAboveAbstraction.forEach((node, i) => {
            node.x = node.fx = TREE_NODE_WIDTH * i - totalParentHeight/2;
            node.y = node.fy = -TREE_NODE_HEIGHT;
            node.radius = MIN_NODE_RADIUS;

            if (this.props.activeNode && node.data.id === this.props.activeNode.id) {
                node.active = true
            }

            nodesById[node.data.id] = node
        })

        // the child nodes
        nodesBelowAbstraction.forEach(node => {
            node.fx = node.x;
            node.fy = node.y;
            node.radius = MIN_NODE_RADIUS;

            if (this.props.activeNode && node.data.id === this.props.activeNode.id) {
                node.active = true
            }

            nodesById[node.data.id] = node
        })

        // the linked nodes
        nodesOutsideAbstraction
            .forEach(node => {
                node.radius = MIN_NODE_RADIUS;

                nodesById[node.data.id] = node
            })

        edgesOutsideAbstraction.forEach(link => {
            link.source = nodesById[link.start]
            link.target = nodesById[link.end]

            // link.opacity = strokeScale(link.count || 0)
        })

        this.nodesById = nodesById

        this.simulation.nodes([...nodesAboveAbstraction, ...nodesBelowAbstraction, ...nodesOutsideAbstraction])
        this.simulation.force("link").links(edgesOutsideAbstraction)

        this.simulation.alpha(1)

        // do the work before rendering
        for (let i = 0; i < iterations; ++i) this.simulation.tick()

        const nodeOutsideElements = nodesOutsideAbstraction.map(node => (
            <NodeOutside
                key={node.data.id}
                node={node}
                drag={this.drag}
                onClick={this.onNodeClick}
                onContextMenu={this.openContextMenu}
            />
        ))

        const edgeOutsideElements = edgesOutsideAbstraction.map(link => (
            // TODO: when adding a key here, these components don't update on change, why? - 2018-02-14
            <LinkOutside
                link={link}
            />
        ))


        const nodeAboveElements = nodesAboveAbstraction.map(node => (
            <NodeAbove
                key={node.data.id}
                node={node}
                drag={this.props.drag}
                onClick={this.onNodeClick}
                onContextMenu={this.openContextMenu}
            />
        ))

        const linkAboveElements = nodesAboveAbstraction.map(node => (
            <LinkAbove
                key={node.data.id}
                link={{
                    x: 0,
                    y: 0,
                    data: { ...this.props.focusNode },
                    parent: node
                }}
            />
        ))

        return (
            <div>
                <ZoomButtons
                    zoomIn={() => this.zoom.zoomIn()}
                    zoomOut={() => this.zoom.zoomOut()}
                    zoomFit={() => this.zoom.zoomFit()}
                />
                <ToggleShowLinks disabled={ edgesOutsideAbstraction.length === 0 } />
                <ContextMenu 
                    closeContextMenu={this.closeContextMenu}
                    opened={this.state.contextMenu.opened}
                    nodeId={this.state.contextMenu.nodeId}
                    currentEvent={this.state.contextMenu.currentEvent}
                >
                    <ContextMenuItem onClick={() => this.onNodeFocus(this.state.contextMenu.nodeId)}>Edit</ContextMenuItem>
                    <ContextMenuItem onClick={() => this.removeNodeFromCollection(this.state.contextMenu.nodeId)}>Remove from collection</ContextMenuItem>
                    <ContextMenuItem onClick={() => this.removeNode(this.state.contextMenu.nodeId)}>Delete</ContextMenuItem>
                </ContextMenu>
                <ManipulationLayer { ...this.props }>
                    { showLinks ? edgeOutsideElements : null }
                    { showLinks ? nodeOutsideElements : null }
                    { linkAboveElements }
                    { nodeAboveElements }
                    <HierarchyGraph
                        treeData={treeData}
                        nodesAboveAbstraction={nodesAboveAbstraction}
                        focusNode={this.props.focusNode}
                        nodes={nodesBelowAbstraction}
                        links={edgesBelowAbstraction}
                        hierarchyLinks={hierarchyLinks}
                        isLoading={this.props.isLoading}
                        showLinks={showLinks}
                        onNodeClick={this.onNodeClick}
                        onNodeFocus={this.onNodeFocus}
                        onNodeContextMenu={this.openContextMenu}
                        drag={this.drag}
                        showAddNodeWindow={this.props.showAddNodeWindow}
                        nodeWidth={TREE_NODE_WIDTH}
                    />
                </ManipulationLayer>

            </div>
        )
    }
}

class ContextMenu extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            x: 0,
            y: 0,
        }

        this.registerHandlers = this.registerHandlers.bind(this);
        this.unregisterHandlers = this.unregisterHandlers.bind(this);
        this.handleHide = this.handleHide.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.renderChildren = this.renderChildren.bind(this);
    }

    componentDidUpdate() {
        /*
         * Determine the actual position of the DOM element
        */
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.opened && nextProps.opened) {
            // opening
            this.registerHandlers();
        }
        else if (this.props.opened && !nextProps.opened) {
            // closing
            this.unregisterHandlers();
        }
    }

    registerHandlers () {
        document.addEventListener('mousedown', this.handleClickOutside);
        document.addEventListener('ontouchstart', this.handleClickOutside);
        document.addEventListener('scroll', this.handleHide);
        document.addEventListener('contextmenu', this.handleHide);
        // document.addEventListener('keydown', this.handleKeyNavigation);
        window.addEventListener('resize', this.handleHide);
    }

    unregisterHandlers () {
        document.removeEventListener('mousedown', this.handleClickOutside);
        document.removeEventListener('ontouchstart', this.handleClickOutside);
        document.removeEventListener('scroll', this.handleHide);
        document.removeEventListener('contextmenu', this.handleHide);
        // document.removeEventListener('keydown', this.handleKeyNavigation);
        window.removeEventListener('resize', this.handleHide);
    }

    handleHide(e) {
        if (this.props.opened) {
            this.props.closeContextMenu()
        }
    }

    handleClickOutside(e) {
        if (this.props.opened && !this.menu.contains(e.target)) {
            this.props.closeContextMenu()
        }
    }

    renderChildren(children) {
        /*
         * add props to the children
        */
        return React.Children.map(children, child => (
            React.cloneElement(child, {
                closeContextMenu: this.props.closeContextMenu
            })
        ))

    }

    render() {
        const { children, currentEvent, opened } = this.props


        if (!opened) {
            return null;
        }

        const className = classNames("contextMenu", {
            "contextMenu-opened": opened
        })

        const x = currentEvent.clientX
        const y = currentEvent.clientY

        const styles = {
            top: y,
            left: x,
        }

        return (
            <nav
                ref={(ref) => this.menu = ref} role='menu' tabIndex='-1' style={styles} className={className}
                onContextMenu={this.handleHide} onMouseLeave={this.handleHide}>
                { this.renderChildren(children) }
            </nav>
        )
    }
}

class ContextMenuItem extends React.Component {
    constructor(props) {
        super(props)

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        e.preventDefault();

        this.props.onClick()
        this.props.closeContextMenu()
    }

    render() {
        const { children } = this.props

        const className = "contextMenu-item"

        return (
            <div
                className={className}
                role="menuitem" tabIndex="-1"
                onClick={this.handleClick}
                >
                { children }
            </div>
        )
    }
}

export default connect(
    null,
    { dragElement, showAddNodeWindow },
)(withRouter(ExploreGraph))


