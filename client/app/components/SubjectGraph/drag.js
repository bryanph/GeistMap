import {
    event as currentEvent,
    selectAll as d3SelectAll,
    select as d3Select 
} from 'd3-selection'

export default (simulation) => (actions) => {

    let startX = null
    let startY = null;

    return {
        dragstart: function(d) {
            /*
             * Freeze the graph
             */

            if (d.isRootCollection) {
                return;
            }

            if (!currentEvent.active) {
                simulation.alphaTarget(0.8).restart();
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

            d.fx = currentEvent.x;
            d.fy = currentEvent.y; 

        },
        dragend: function(d) {
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
