import * as d3 from 'd3'
import { colora, colorb, colorc, colorNode } from './util'

export default (zoom, actions) => {

    return {
        nodeClickNoDrag: (e) => {
            /*
             * Render node tooltip
             */
            const node = d3.select(e.target.parentNode)

            const data = node.datum()

            actions.loadNode(data.id, true)
                .then(() => actions.showGraphSideBar(data.id))
                .then(() => window.scrollTo(0, 0))

            colorNode(node)
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
