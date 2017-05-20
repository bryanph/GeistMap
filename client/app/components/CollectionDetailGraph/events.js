/*
 * Events specific to NodeOverviewGraph
 */
import * as d3 from 'd3'

export default (actions) => {
    return {
        // nodeClickNoDrag: (selection) => {
        nodeClick: (d) => {
            /*
             * Render node tooltip
             */
            const data = d

            // TODO: different way? - 2016-09-05
            const { collectionId } = actions

            // TODO: handle the loading in the component based on the route - 2017-02-09
            actions.loadNode(data.id, true)
                .then(() => actions.router.location.push(`/app/collections/${collectionId}/nodes/${data.id}`))
                .then(() => window.scrollTo(0, 0))
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
