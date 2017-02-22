

import * as d3 from 'd3'
import { getLabelText } from './util'
import { colora, colorb, colorc, colorNode } from './util'
import { NODE_RADIUS, WIDTH, HEIGHT } from './constants'
import Rx from 'rx'

export default (events, simulation) => (zoom, paddingPercent=0.95, id=null) => (enter=[], update=[], exit=[]) => {
    /*
     * enter, update, exit are arrays of callables which will be called with the current selection
    */

    return {
        enterNode: (selection) => {
            selection
                .attr("class", "node")
                .classed('enter-selection', true) // for rxjs..
                .attr('id', (d) => {
                    return `node-${d.id}`
                }) // for later reference from data
                // TODO: set these events dynamically, must be able to specify these - 2016-07-28
                .on('mouseover', _.debounce(events.nodeMouseOver, 200))
                .on('mouseout', _.debounce(events.nodeMouseOut, 200))
                // .on('click', nodeClick)
                // .on('dblclick', nodeDoubleClick)

            enter.forEach(enterFn => enterFn(selection))

            // selection
            //     .append('circle')
            //     .attr("r", NODE_RADIUS)
            //     .attr("x", -8)
            //     .attr("y", -8)
            //     .style("fill", d => colora(d.group))

            // selection.append('text')
            //     .attr("dx", NODE_RADIUS)
            //     .attr("dy", ".35em")
            //     .text((d) => getLabelText(d.properties.name));

            // remove enter-selection flag for rxjs...

            selection.classed('enter-selection', false)

            if (selection.size() > 0) {
                console.log("in enter selection: " + selection.size());
                // new nodes were added
                // TODO: is there an on-render event? bind to that instead - 2016-07-28
                setTimeout(() => zoom(paddingPercent, 1000), 1000)
                // simulation.alpha(0.8).restart();
            }

            return selection

        },
        updateNode: (selection) => {
            selection.select('text').text(d => {
                return getLabelText(d.properties.name)
            })

            update.forEach(updateFn => selection.call(updateFn))

            return selection
        }, 
        exitNode: (selection) => {
            // console.log('called removeNode');
            // console.log(selection.size());
            selection.remove()

            return selection
        }
    }
}
