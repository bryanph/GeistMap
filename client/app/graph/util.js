import { scaleOrdinal, schemeCategory20, schemeCategory20b, schemeCategory20c } from 'd3'
import { accentColor } from '../containers/App/muitheme.js'

import * as d3 from 'd3'
export const colora = scaleOrdinal(schemeCategory20)
export const colorb = scaleOrdinal(schemeCategory20b)
export const colorc = scaleOrdinal(schemeCategory20c)

import { secondaryColor } from '../containers/App/muitheme'

export const radiusScale = d3.scaleLinear().range(10, 20)

export function getLabelText(text) {
    /*
     * Max length for label text
     */
    if (text.length < 15) {
        return text
    }

    return text
    return text.slice(0, 15) + '...'
}

export function colorNode(node) {
    /*
     * // TODO: find a better way to do this - 2016-07-29
     */

    // reset other nodes to original color
    const prevSelectedNodes = d3.select('.node-selected')
        .classed("node-selected", false)
        .select('circle')
        .style("fill", d => {
            if (!d.collections) {
                return colora(d.group)
            }

            return colora(d.collections.sort().join(','))
        })

    // color this node as the active node
    node
        .classed("node-selected", true)
        .select('circle')
        .style("fill", secondaryColor)

}
