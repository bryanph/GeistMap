import {
    event as currentEvent,
    selectAll as d3SelectAll,
    select as d3Select,
    mouse as currentMouse,
} from 'd3-selection'

import { NODE_RADIUS } from '../constants'

export const createOuterDrag = (simulation) => (actions) => {
    return {
        dragstart: function(d) {
            const mouseXy = currentMouse(this.container.node())
            this.graph.dragLine
                .classed("hidden", false)
                .attr("d", `M ${d.x} ${d.y} L ${mouseXy[0]} ${mouseXy[1]}`);

        },
        drag: function(d) {
            const mouseXy = currentMouse(this.container.node())
            this.graph.dragLine
                .attr("d", `M ${d.x} ${d.y} L ${mouseXy[0]} ${mouseXy[1]}`);

            const nodeSelection = d3SelectAll('.node')
            const prevHoveredNodes = d3SelectAll('.node-hovered')

            // back to their default color again
            prevHoveredNodes.select('circle')
            prevHoveredNodes.classed('node-hovered', false)

            nodeSelection.each(node => {
                if (node === d) return

                const distanceToNode = Math.sqrt((node.x - mouseXy[0])**2 + (node.y - mouseXy[1])**2)

                if (distanceToNode < node.radius) {
                    // change background color
                    d3Select(`#node-${node.id}`)
                        .classed('node-hovered', true)
                        .select('circle')
                }
            })

        },
        dragend: function(d) {
            const mouseXy = currentMouse(this.container.node())
            const nodeSelection = d3SelectAll('.node')
            const { nodes } = this.props

            this.graph.dragLine.classed("hidden", true)

            const prevHoveredNodes = d3SelectAll('.node-hovered')
            // back to their default color again
            prevHoveredNodes.select('circle')
            prevHoveredNodes.classed('node-hovered', false)

            nodeSelection.each(node => {
                if (node.id === d.id) return

                const distanceToNode = Math.sqrt((node.x - mouseXy[0])**2 + (node.y - mouseXy[1])**2)

                if (distanceToNode < node.radius) {
                    // create an edge from this node to otherNode
                    return actions.connect(d.id, node.id)
                }
            })
        }
    }
}

export const createInnerDrag = (simulation) => (actions) => {
    // TODO: ew... - 2016-08-24
    let startX = null
    let startY = null;

    return {
        dragstart: function(d) {
            /*
             * Freeze the graph
             */
            startX = currentEvent.x
            startY = currentEvent.y

            const nodeSelection = d3SelectAll('.node')

            // simulation.stop()
            nodeSelection.each(node => {
                node.fx = node.x
                node.fy = node.y
            })
        },
        drag: function(d) {
            // first just move ...
            d.fx = currentEvent.x;
            d.fy = currentEvent.y;

            const nodeSelection = d3SelectAll('.node')

            const prevHoveredNodes = d3SelectAll('.node-hovered')

            // back to their default color again
            prevHoveredNodes.select('circle')
            prevHoveredNodes.classed('node-hovered', false)

            nodeSelection.each(node => {
                if (node === d) return

                const distanceToNode = Math.sqrt((node.x - d.x)**2 + (node.y - d.y)**2)

                if (distanceToNode < node.radius) {
                    // change background color
                    d3Select(`#node-${node.id}`)
                        .classed('node-hovered', true)
                        .select('circle')
                }
            })
        },
        dragend: function(d) {
            /*
             * Create an edge to all nodes which are being hovered over
             */
            const nodeSelection = d3SelectAll('.node')

            d.fx = null;
            d.fy = null;

            // if we only moved the mouse in a square of 8px, assume it was a click instead of a drag
            const dx = Math.abs(startX - currentEvent.x)
            const dy = Math.abs(startY - currentEvent.y)
            if (dx < 8 && dy < 8) {
                nodeSelection.each(node => {
                    node.fx = null
                    node.fy = null
                })

                // TODO: call the click action instead - 2017-07-16
                return
            }

            const prevHoveredNodes = d3SelectAll('.node-hovered')
            // back to their default color again
            prevHoveredNodes.select('circle')
            prevHoveredNodes.classed('node-hovered', false)

            nodeSelection.each(node => {
                // undo fixed state as set in dragstart
                node.fx = null
                node.fy = null

                if (node === d) return

                const distanceToNode = Math.sqrt((node.x - d.x)**2 + (node.y - d.y)**2)

                if (distanceToNode < node.radius) {
                    // move this node to the abstraction that is hovered over
                    // TODO: need a method for getting the currently visible abstraction chain
                    return actions.moveToAbstraction(
                        this.props.focusNode.id,
                        d.id,
                        node.id,
                    )
                }
            })

            if (!currentEvent.active) {
                simulation.alpha(0.5).restart();
            }
        }
    }
}
