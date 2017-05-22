import { accentColor } from '../containers/App/muitheme.js'
import {
    scaleOrdinal,
    scaleLinear,
    schemeCategory20,
    schemeCategory20b,
    schemeCategory20c
} from 'd3-scale'
import { select as d3Select } from 'd3-selection'

export const colora = scaleOrdinal(schemeCategory20)
export const colorb = scaleOrdinal(schemeCategory20b)
export const colorc = scaleOrdinal(schemeCategory20c)

// work around for now to make sure collections have a fixed color
colora(undefined)
colorb(undefined)
colorc(undefined)

import { secondaryColor } from '../containers/App/muitheme'

export const radiusScale = scaleLinear().range(10, 20)

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

export function colorNode(d) {
    /*
     * Assign a color to a node based on its collections
    */
    if (!d.collections) {
        return colora(d.group)
    }

    return colora(d.collections.sort().join(','))
}

export function colorActiveNode(node) {
    /*
     * // TODO: find a better way to do this - 2016-07-29
     */

    // reset other nodes to original color
    const prevSelectedNodes = d3Select('.node-selected')
        .classed("node-selected", false)
        .select('circle')
        .style("fill", colorNode)

    // color this node as the active node
    node
        .classed("node-selected", true)
        .select('circle')
        .style("fill", secondaryColor)

}
