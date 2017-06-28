import { 
    event as currentEvent,
    selectAll as d3SelectAll,
    select as d3Select,
    mouse as currentMouse,
} from 'd3-selection'

import { colorNode } from '../../graph/util'
import { NODE_RADIUS } from '../../graph/constants'

export default (simulation) => (actions) => {

    // TODO: ew... - 2016-08-24
    let startX = null
    let startY = null;

    return {
        dragstart: function(d) {
            /*
             * Freeze the graph
             */
            if (this.props.mode === 'edit') {
                this.graph.dragLine
                    .classed("hidden", false)
                    .attr("d", `M ${d.x} ${d.y} L ${currentEvent.x} ${currentEvent.y}`);
            } else {
                if (!currentEvent.active) {
                    simulation.alphaTarget(0.5).restart();
                    // simulation.alpha(0.8).restart();
                }

                d.fx = d.x;
                d.fy = d.y
            }
        },
        drag: function(d) {
            currentEvent.x
            if (this.props.mode === 'edit') {
                this.graph.dragLine
                    .attr("d", `M ${d.x} ${d.y} L ${currentEvent.x} ${currentEvent.y}`);
            }
            else {
                // just move ...
                d.fx = currentEvent.x;
                d.fy = currentEvent.y; 
            }
        },
        dragend: function(d) {
            /*
             * Create an edge to all nodes which are being hovered over
             */
            if (this.props.mode === 'edit') {
                const nodeSelection = d3SelectAll('.node')
                const { nodes } = this.props

                this.graph.dragLine.classed("hidden", true)

                nodeSelection.each(node => {
                    if (node.id === d.id) return

                    const distanceToNode = Math.sqrt((node.x - currentEvent.x)**2 + (node.y - currentEvent.y)**2)

                    if (distanceToNode < NODE_RADIUS) {
                        // create an edge from this node to otherNode
                        return actions.connect(d.id, node.id)
                    }
                })

            }
            else {
                if (!currentEvent.active) {
                    simulation.alphaTarget(0);
                    // simulation.alpha(0.8).restart();
                }

                d.fx = null
                d.fy = null
            }
        }
    }
}

