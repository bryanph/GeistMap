/*
 * Events specific to NodeOverviewGraph
 */
import * as d3 from 'd3'
import { colora, colorb, colorc, colorNode } from '../../graph/util'
import { getLabelText } from '../../graph/util'


export default (zoom, actions) => {
    return {
        enterNode: (selection, radiusScale) => {
            selection
                .append('circle')
                .attr("r", (d) => radiusScale(d.count || 0))
                .attr("x", -8)
                .attr("y", -8)
                .style("fill", d => colora(d.group))

            selection.append('text')
                .attr("dx", (d) => radiusScale(d.count || 0))
                .attr("dy", ".35em")
                .text((d) => getLabelText(d.properties.name));
        },
        nodeClickNoDrag: (selection) => {
            /*
             * Render node tooltip
             */
            const domNodes = document.querySelectorAll('.node.enter-selection')
            const clickStream = Rx.Observable.fromEvent(domNodes, 'click')

            clickStream.subscribe((e) => {
                const node = d3.select(e.target.parentNode)

                const data = node.datum()

                actions.router.push(`/app/collections/${data.id}/`)
                // actions.loadCollection(data.id, true)
                //     .then(() => actions.showCollectionSidebar({ id: data.id}))
                //     .then(() => window.scrollTo(0, 0))

                colorNode(node)
            })

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
