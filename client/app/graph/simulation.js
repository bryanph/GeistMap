import * as d3 from 'd3'
import { NODE_RADIUS, WIDTH, HEIGHT } from './constants'

export default (WIDTH, HEIGHT) => ({
    simulation: d3.forceSimulation()
        // .alphaTarget(0.01)
        .alphaDecay(1 - Math.pow(0.001, 1/400))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("link", 
            d3.forceLink()
                .id(d => d.id)
                .distance(100)
                // .strength(1)
        )
        .force("x", d3.forceX().strength(0.1))
        .force("y", d3.forceY().strength(0.1))
        .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2)),

    ticked: (selection) => {
        selection.selectAll('.node')
            .call(transformNode);
        selection.selectAll('.node-link')
            .call(transformLink);
    }
})



function linkArc(d, curved=false) {
    // TODO: check adjacencyMap for whether there is an edge the otherway as well - 2017-01-22
    const dx = d.target.x - d.source.x;
    const dy = d.target.y - d.source.y;
    const lineDistance = Math.sqrt(dx * dx + dy * dy);
    const dr = curved ? lineDistance : 0;

    // distance from source node to edge of target node
    // const nodeDistance = lineDistance - d.target.r

    const ox = (dx * NODE_RADIUS) / lineDistance
    const oy = (dy * NODE_RADIUS) / lineDistance

        // TODO: get node radius here - 2017-01-22
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + (d.target.x - ox) + "," + (d.target.y - oy);
}

function drawPath(d) {
    const s = d.source
    const t = d.target
    const path = [
        'M', s.x, s.y,
        'L', t.x, t.y,

        // 'L', endShaft, shaftRadius,
        // 'L', endShaft, headRadius,
        // 'L', endArrow, 0,
        // 'L', endShaft, -headRadius,
        // 'L', endShaft, -shaftRadius,
        // 'L', startArrow, -shaftRadius,
        'Z'
    ].join(' ')

    console.log(path);
    return path
}


const transformNode = (selection) => {
    return selection
        // .attr("cx", d => d.x)
        // .attr("cy", d => d.y)
            .attr("transform", (d) => {
                return "translate(" 
                    // + Math.max(minNodeXPos, Math.min(maxNodeXPos, d.x))
                    // + ","
                    // + Math.max(minNodeYPos, Math.min(maxNodeYPos, d.y))
                    + d.x
                    + ","
                    + d.y
                    + ")"
            });
};


const transformLink = (selection) => {
    // TODO: proper selection here for tick - 2016-06-13
    return selection
        .attr('d', (d) => linkArc(d, d.curved))
    // return selection
    //     .attr("x1", (d) => d.source.x)
    //     .attr("y1", (d) => d.source.y)
    //     .attr("x2", (d) => d.target.x)
    //     .attr("y2", (d) => d.target.y);

};
