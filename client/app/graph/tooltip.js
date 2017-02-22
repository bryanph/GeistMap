
import * as d3 from 'd3'
const d3tip = require('d3-tip')
d3.tip = d3tip

export const nodeTooltip = d3.tip(d3)
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        return "<strong>Frequency:</strong> <span style='color:red'>" + d.name + "</span>";
    })

export const linkTooltip = d3.tip()
    .attr('class', 'd3-tip')
    .html(function(d) {
        return "<strong>Frequency:</strong> <span style='color:red'>" + d.name + "</span>";
    })

