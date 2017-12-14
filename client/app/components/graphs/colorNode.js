import flatten from 'lodash/flatten'
import { select as d3Select } from 'd3-selection'

import {
    scaleOrdinal,
    schemeCategory20,
    schemeCategory20b,
    schemeCategory20c
} from 'd3-scale'

const colora = scaleOrdinal(schemeCategory20)
const colorb = scaleOrdinal(schemeCategory20b)
const colorc = scaleOrdinal(schemeCategory20c)

// work around for now to make sure collections have a fixed color
colora(undefined)
colorb(undefined)
colorc(undefined)

export function colorNode(d) {
    /*
     * Assign a color to a node based on its collections
    */
    return colora(flatten(d.collections).sort().join(','))
}

export function colorActiveNode(node) {
    d3Select(".nodeActive").classed("nodeActive", false)
    node.classed("nodeActive", true)
}

