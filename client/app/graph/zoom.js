import { zoom as d3Zoom, zoomIdentity } from 'd3-zoom'
import { event as currentEvent, } from 'd3-selection'

export default (root, viewboxWidth, viewboxHeight, allowZoomIn=false) => {

    const zoom = d3Zoom()
        .scaleExtent([1/4, 2])
        .on('zoom', function () {
            root.attr("transform", currentEvent.transform)
            // root.attr('transform',
            //     'translate(' + currentEvent.translate + ')'
            //         +   'scale(' + currentEvent.scale     + ')');
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

        function transform() {
            return zoomIdentity
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

