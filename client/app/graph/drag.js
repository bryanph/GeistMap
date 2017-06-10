import { 
    event as currentEvent,
    selectAll as d3SelectAll,
    select as d3Select 
} from 'd3-selection'
import { NODE_RADIUS } from './constants'
import { colorNode } from './util'
import { secondaryColor } from '../containers/App/muitheme'

export default (simulation) => (actions) => {

    // TODO: ew... - 2016-08-24
    let startX = null
    let startY = null;

    return {
        dragstart: function(d) {
            /*
             * Freeze the graph
             */
            // startX = currentEvent.x
            // startY = currentEvent.y

            // const nodeSelection = d3SelectAll('.node')

            // // simulation.stop()
            // nodeSelection.each(node => {
            //     node.fx = node.x
            //     node.fy = node.y
            // })

            if (d.isRootCollection) {
                return;
            }

            if (!currentEvent.active) {
                simulation.alphaTarget(0.3).restart();
                // simulation.alpha(0.8).restart();
            }

            d.fx = d.x;
            d.fy = d.y
        },
        drag: function(d) {
            /*
             * Set a graphical indicator for when hovering over another node
             * O(n): we must check distance to all other nodes
             */
            if (d.isRootCollection) {
                return;
            }

            // first just move ...
            d.fx = currentEvent.x;
            d.fy = currentEvent.y; 

            // // const { nodes } = this.props
            // const nodeSelection = d3SelectAll('.node')

            // const prevHoveredNodes = d3SelectAll('.node-hovered')
            // // back to their default color again
            // prevHoveredNodes.select('circle')
            //     .style("fill", colorNode)
            // prevHoveredNodes.classed('node-hovered', false)

            // nodeSelection.each(node => {
            //     if (node === d) return

            //     const distanceToNode = Math.sqrt((node.x - d.x)**2 + (node.y - d.y)**2)

            //     if (distanceToNode < NODE_RADIUS) {
            //         // change background color
            //         d3Select(`#node-${node.id}`)
            //             .classed('node-hovered', true)
            //             .select('circle')
            //             .style("fill", secondaryColor)

            //     }
            // })
        },
        dragend: function(d) {
            /*
             * Create an edge to all nodes which are being hovered over
             */
            // const nodeSelection = d3SelectAll('.node')
            // const { nodes } = this.props

//             d.fx = null;
//             d.fy = null;

//             // if we only moved the mouse in a square of 8px, assume it was a click instead of a drag
//             const dx = Math.abs(startX - currentEvent.x)
//             const dy = Math.abs(startY - currentEvent.y)
//             if (dx < 8 && dy < 8) {
//                 nodeSelection.each(node => {
//                     if (node.isRootCollection) {
//                         return;
//                     }
//                     node.fx = null
//                     node.fy = null
//                 })

//                 // if (actions.click) {
//                 //     actions.click(d);
//                 // }

//                 // simulation.stop()
//                 return
//             }

//             const prevHoveredNodes = d3SelectAll('.node-hovered')
//             // back to their default color again
//             prevHoveredNodes.select('circle')
//                 .style("fill", colorNode)
//             prevHoveredNodes.classed('node-hovered', false)

//             nodeSelection.each(node => {
//                 // undo fixed state as set in dragstart
//                 if (node.isRootCollection) {
//                     return;
//                 }

//                 node.fx = null
//                 node.fy = null

//                 if (node === d) return

//                 const distanceToNode = Math.sqrt((node.x - d.x)**2 + (node.y - d.y)**2)

//                 if (distanceToNode < NODE_RADIUS) {
//                     // create an edge from this node to otherNode
//                     return actions.connect(d.id, node.id, "to", true)
//                 }
//             })

            if (d.isRootCollection) {
                return;
            }

            if (!currentEvent.active) {
                simulation.alphaTarget(0);
                // simulation.alpha(0.8).restart();
            }
            d.fx = null
            d.fy = null
        }
    }
}
