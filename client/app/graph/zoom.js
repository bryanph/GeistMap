import * as d3 from 'd3'

export default (root, viewboxWidth, viewboxHeight, allowZoomIn=false) => {

    const zoom = d3.zoom()
        .scaleExtent([1/4, 2])
        .on('zoom', function () {
            // console.log("zoom", d3.event.transform);
            root.attr("transform", d3.event.transform)
            // console.trace("zoom", d3.event.translate, d3.event.scale);
            // root.attr('transform',
            //     'translate(' + d3.event.translate + ')'
            //         +   'scale(' + d3.event.scale     + ')');
        })



    function zoomFit(paddingPercent, transitionDuration) {
        var bbox = root.node().getBBox();
        var parent = root.node().parentElement;
        var fullWidth = viewboxWidth,
            fullHeight = viewboxHeight; 
        var width = bbox.width,
            height = bbox.height;
        var midX = bbox.x + width / 2,
            midY = bbox.y + height / 2;

        if (width == 0 || height == 0) return; // nothing to fit
        var scale = (paddingPercent || 0.75) / Math.max(width / fullWidth, height / fullHeight);
        if (!allowZoomIn && scale > 1) return
        var translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];

        // console.log(root.node());
        // console.log(bbox);
        // console.log("fullwidth/height", fullWidth, fullHeight);
        // console.log("width, height",width, height);
        // console.log("bbox x,y", bbox.x, bbox.y);
        // console.log("midpoints", midX, midY);
        console.log(transitionDuration);
        console.log("actual translate", translate, scale);

        function transform() {
            return d3.zoomIdentity
                .translate(translate[0], translate[1])
                .scale(scale)
        }

        root
            .transition()
            .duration(transitionDuration || 0) // milliseconds
            .call(zoom.transform, transform)
            // .call(zoom.translate(translate).scale(scale).event);
    }

    return zoomFit
}

