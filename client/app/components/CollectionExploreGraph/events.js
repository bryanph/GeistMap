/*
 * Events specific to NodeOverviewGraph
 */
import * as d3 from 'd3'
import { colora, colorb, colorc, colorNode } from '../../graph/util'

export default (zoom, actions) => {
    return {
        nodeClickNoDrag: (selection) => {
            /*
             * Render node tooltip
             */
            const domNodes = document.querySelectorAll('.node.enter-selection')
            const clickStream = Rx.Observable.fromEvent(domNodes, 'click')

            // const mouseDownStream = Rx.Observable.fromEvent(domNodes, 'mousedown')
            // const mouseUpStream = Rx.Observable.fromEvent(domNodes, 'mouseup')
            // const mouseMoveStream = Rx.Observable.fromEvent(domNodes, 'mousemove')


            // const clickNoDrag = Rx.Observable.zip(
            //     mouseDownStream,
            //     mouseUpStream
            // ).filter(([startEvent, endEvent]) => {
            //     // TODO: error bound for no drag - 2016-06-18
            //     console.log('click...');
            //     return startEvent.clientX === endEvent.clientX && startEvent.clientY === endEvent.clientY
            // })
            // .map(([e1, e2]) => d3.select(e2.target.parentNode))

            // clickNoDrag.subscribe(nodeClickNoDrag.bind(null, showGraphSideBar))

            clickStream.subscribe((e) => {
                const node = d3.select(e.target.parentNode)

                // for click outside behaviour
                // e.stopPropagation()

                const data = node.datum()

                actions.loadNode(data.id, true)
                    .then(() => actions.showGraphSideBar(data.id))
                    .then(() => window.scrollTo(0, 0))

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
