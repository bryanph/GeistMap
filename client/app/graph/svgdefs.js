
/*
 * SVG definitions
*/

import { lightAccentColor } from '../containers/App/muitheme.js'

export function arrowHeadMiddle(selection) {
    selection
        .append('marker')
        .attr("id", "Triangle")
        .attr('viewBox', "0 0 8 8")
        .attr("refX", 0)
        .attr("refY", 4)
        .attr("markerUnits", 'userSpaceOnUse')
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("orient", 'auto')
        .append('path')
        .style("fill", lightAccentColor)
        .attr("d", 'M0,0 L0,8 L9,4 z');
}

// curved
export function arrowHead(selection) {
    selection
        .append('marker')
        .attr("id", "Triangle")
        .attr('viewBox', "0 0 8 8")
        .attr("refX", 10)
        .attr("refY", 4)
        .attr("markerUnits", 'userSpaceOnUse')
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("orient", 'auto')
        .append('path')
        .attr("d", 'M0,0 L0,8 L9,4 z');
        // .append('marker')
        // .attr("id", 'Triangle')
        // .attr("viewBox", "0 -5 10 10")
        // .attr("refX", 15)
        // .attr("refY", -1.5)
        // .attr("markerWidth", 4)
        // .attr("markerHeight", 4)
        // .attr("orient", "auto")
        // .append("path")
        // .style("fill", lightAccentColor)
        // .attr("d", "M0,-5 L10,0 L0,5");
}

// straight
export function straightArrowHead(selection) {
    selection
        .append('marker')
        .attr("id", 'Triangle')
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 4)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("path")
        .style("fill", lightAccentColor)
        .attr("d", "M0,-5 L10,0 L0,5");
}

