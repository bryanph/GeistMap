import * as d3 from 'd3'

// TODO: allow me to basically "plugin" different events - 2016-07-28
export default (events) => (enter=[], update=[], exit=[]) => {
    return  {
        enterLink: (selection) => {
            // TODO: proper selection here for tick - 2016-06-13
            return selection
                .append("path")
                .attr('id', (d) => `link-${d.id}`) // for later reference from data
                .attr("class", "node-link")
                .attr("marker-end", "url(#Triangle)")
                .on('dblclick', events.linkDoubleClick)
                // .append("path")
                // .attr('id', (d) => `link-${d.id}`) // for later reference from data
                // .attr('fill', (d) => lightAccentColor)
                // .attr("class", "node-link")
                // .on('dblclick', events.linkDoubleClick)
                // .attr("marker-mid", "url(#Triangle)")
        }
    }
}

