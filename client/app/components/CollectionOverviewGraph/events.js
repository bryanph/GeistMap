/*
 * Events specific to NodeOverviewGraph
 */
import * as d3 from 'd3'
import { colorNode } from '../../graph/util'
import { getLabelText } from '../../graph/util'


export default (actions) => {
    return {
        enterNode: (selection, radiusScale) => {
            selection
                .append('circle')
                .attr("r", (d) => d.radius)
                .attr("x", -8)
                .attr("y", -8)
                .style("fill", colorNode)

            selection.append('text')
                .attr("dx", (d) => d.radius)
                .attr("dy", ".35em")
                .text((d) => getLabelText(d.properties.name));
        },
        nodeClick: (data) => {
            /*
             * Render node tooltip
             */
            actions.router.location.push(`/app/collections/${data.id}/`)
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
