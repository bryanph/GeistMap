/*
 * Events specific to NodeOverviewGraph
 */
import * as d3 from 'd3'
import { colora, colorb, colorc, colorNode } from '../../graph/util'

export default (zoom, actions) => {
    return {
        // nodeClickNoDrag: (selection) => {
        nodeClickNoDrag: (d) => {
            /*
             * Render node tooltip
             */
            // const domNodes = document.querySelectorAll('.node.enter-selection')
            // const clickStream = Rx.Observable.fromEvent(domNodes, 'click')

            // const mouseDownStream = Rx.Observable.fromEvent(domNodes, 'mousedown')
            // const mouseUpStream = Rx.Observable.fromEvent(domNodes, 'mouseup')
            // // const mouseMoveStream = Rx.Observable.fromEvent(domNodes, 'mousemove')

            // mouseDownStream.subscribe((e) => {
            //     console.log('called mousedown...');
            // })
            // mouseUpStream.subscribe((e => {
            //     console.log('called mouseup...');
            // }))

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

            // clickNoDrag.subscribe((e) => {
            // clickStream.subscribe((e) => {
                // for click outside behaviour
                // e.preventDefault()
                // e.stopPropagation()


                const data = d

                actions.router.push(`/app/inbox/${data.id}`)

                // actions.loadNode(data.id, true)
                //     .then(() => actions.router.push(`/app/inbox/${data.id}`))
                //     .then(() => window.scrollTo(0, 0))
                //     .then(() => actions.changeMainFocus('left'))

                // actions.loadNode(data.id, true)
                //     .then(() => actions.showGraphSideBar(data.id))
                //     .then(() => window.scrollTo(0, 0))

                // actions.showGraphSideBar(data.id)
                // window.scrollTo(0, 0)
                // colorNode(d3.select(`#node-${data.id}`))
            // })

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
