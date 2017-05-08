/*
 * Events specific to NodeOverviewGraph
 */
import * as d3 from 'd3'

export default (actions) => {
    return {
        // nodeClickNoDrag: (selection) => {
        nodeClickNoDrag: (d) => {
            /*
             * Render node tooltip
             */
            actions.router.push(`/app/inbox/${d.id}`)
        },
        nodeDoubleClick: (d) => {
            d.fixed = false;
            simulation.restart();
        },
        nodeMouseOver: () => {
            // simulation.stop();

        },
        nodeMouseOut: () => {
            /*
             * TODO: only when node tooltip is not shown
             */
            // simulation.restart();
        },
        linkDoubleClick: (d) => {
            /*
             * call removeEdge() here
             */
            actions.removeEdge(d.id)
        }
    }
}
