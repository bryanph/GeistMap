
import * as d3 from 'd3'
import { NODE_RADIUS } from './constants'
import { colora, colorb, colorc } from './util'
import { secondaryColor } from '../containers/App/muitheme'

export default (simulation) => (actions, clickNoDrag) => {

    // TODO: ew... - 2016-08-24
    let startX = null
    let startY = null;

    return {
        dragstart: function(d) {
            /*
             * Freeze the graph
            */
            if (!d3.event.active) {
                simulation.alpha(0.8).restart();
            }

           startX = d3.event.x
           startY = d3.event.y

            const { nodes } = this.props

            // simulation.stop()
            nodes.forEach(node => {
                node.fx = node.x
                node.fy = node.y
            })
        },
        drag: function(d) {
            /*
             * Set a graphical indicator for when hovering over another node
             * O(n): we must check distance to all other nodes
            */

            // first just move ...
            d.fx = d3.event.x;
            d.fy = d3.event.y; 

            // TODO: instead just stop simulation, update node position and call tick manually - 2016-08-24
            // console.log('calling tick...');
            // simulation.tick()

            const { nodes } = this.props

            const prevHoveredNodes = d3.selectAll('.node-hovered')
            // back to their default color again
            prevHoveredNodes.select('circle')
                .style("fill", d => colora(d.group))
            prevHoveredNodes.classed('node-hovered', false)

            nodes.forEach(node => {
                if (node === d) return

                const distanceToNode = Math.sqrt((node.x - d.x)**2 + (node.y - d.y)**2)

                if (distanceToNode < NODE_RADIUS) {
                    // change background color
                    d3.select(`#node-${node.id}`)
                        .classed('node-hovered', true)
                        .select('circle')
                            .style("fill", secondaryColor)
                        
                }
            })
        },
        dragend: function(d) {
            /*
             * Create an edge to all nodes which are being hovered over
            */
            const { nodes } = this.props


            if (!d3.event.active) simulation.alphaTarget(0);

            d.fx = null;
            d.fy = null;

            const dx = Math.abs(startX - d3.event.x)
            const dy = Math.abs(startY - d3.event.y)
            if (dx < 8 && dy < 8) {
                nodes.forEach(node => {
                    node.fx = null
                    node.fy = null
                })

                if (clickNoDrag) {
                    clickNoDrag(d);
                }

                // TODO: we must perform the "click" code here? - 2016-08-24
                simulation.stop()
                return
            }

            const prevHoveredNodes = d3.selectAll('.node-hovered')
            // back to their default color again
            prevHoveredNodes.select('circle')
                .style("fill", d => colora(d.group))
            prevHoveredNodes.classed('node-hovered', false)

            nodes.forEach(node => {
                // undo fixed state as set in dragstart
                node.fx = null
                node.fy = null

                if (node === d) return

                const distanceToNode = Math.sqrt((node.x - d.x)**2 + (node.y - d.y)**2)

                if (distanceToNode < NODE_RADIUS) {
                    // create an edge from this node to otherNode
                    return actions.connectNodes(d.id, node.id, "to", true)
                }
            })

        }
    }
}
