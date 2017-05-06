
import * as d3 from 'd3'
import { getLabelText } from './util'
import { colora, colorb, colorc, colorNode } from './util'
import { NODE_RADIUS, WIDTH, HEIGHT } from './constants'
import Rx from 'rx'

export default (options={}) => (enter=[], update=[], exit=[]) => {
    /*
     * enter, update, exit are arrays of callables which will be called with the current selection
     */

    return {
        enterNode: (selection, scale) => {
            selection
                .attr("class", "node")
                .classed('enter-selection', true) // for rxjs..
                .attr('id', (d) => {
                    return `node-${d.id}`
                }) // for later reference from data
                .attr('r', NODE_RADIUS)

            // TODO: align these event names? - 2017-05-06
            if (options.events && options.events.nodeMouseOver) {
                selection.on('mouseover', _.debounce(options.events.nodeMouseOver, 200))
            }
            if (options.events && options.events.nodeMouseOut) {
                selection.on('mouseout', _.debounce(options.events.nodeMouseOver, 200))
            }
            if (options.events && options.events.nodeClick) {
                selection.on('click', _.debounce(options.events.nodeClick, 200))
            }
            if (options.events && options.events.nodeDoubleClick) {
                selection.on('doubleclick', _.debounce(options.events.nodeDoubleClick, 200))
            }

            enter.forEach(enterFn => enterFn(selection, scale))

            // TODO: oh no you didn't... - 2016-09-03
            // get rid of this...
            if (enter.length === 0) {
                selection
                    .append('circle')
                    .attr("r", (d) => NODE_RADIUS)
                    .attr("x", -8)
                    .attr("y", -8)
                    .style("fill", d => {
                        console.log(d.collections);
                        if (!d.collections) {
                            return colora(d.group)
                        }

                        return colora(d.collections.sort().join(','))
                    })

                selection.append('text')
                    .attr("dx", NODE_RADIUS + 1)
                    .attr("dy", ".35em")
                    .text((d) => getLabelText(d.properties.name));
            }

            // remove enter-selection flag for rxjs...

            selection.classed('enter-selection', false)

            if (selection.size() > 0) {
                console.log("in enter selection: " + selection.size());
                // new nodes were added
                // TODO: is there an on-render event? bind to that instead - 2016-07-28
                setTimeout(() => options.zoom(options.paddingPercent || 0.95, 1000), 1000)
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
