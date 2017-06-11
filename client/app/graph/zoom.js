import { zoom as d3Zoom, zoomIdentity } from 'd3-zoom'
import { event as currentEvent, } from 'd3-selection'


const setCTM = (element, m) => element.transform.baseVal.initialize(element.ownerSVGElement.createSVGTransformFromMatrix(m))

export default (root, container, fullWidth, fullHeight) => {

    const center = [ fullWidth / 2, fullHeight / 2 ]

    let zoomInProgress = false

    const zoom = d3Zoom()
        // .scaleExtent([1/4, 2])
        .on('start', () => zoomInProgress = true)
        .on('end', () => zoomInProgress = false)
        .on('zoom', function () {
            container.attr("transform", currentEvent.transform)
        })

    // to allow for free zooming
    root.call(zoom)

    const zoomToSelection = (node, d, paddingPercent, transitionDuration) => {
    }



    function zoomFit(paddingPercent=0.7, transitionDuration=1000) {
        /*
         * Zoom to fit to the root node
        */
        if (zoomInProgress) {
            return;
        }

        const bbox = container.node().getBBox();

        // width, height of the node
        var width = bbox.width,
            height = bbox.height;

        // need to have container width and 
        var midX = bbox.x + width/2,
            midY = bbox.y + height/2;

        if (width == 0 || height == 0) return; // nothing to fit

        const scale = paddingPercent * Math.min(fullWidth / width, fullHeight / height)
        const translate = [ -(midX*scale - fullWidth/2), -(midY*scale - fullHeight/2)];

        if (scale > 1) return;

        function transform() {
            return zoomIdentity
                .translate(translate[0], translate[1])
                .scale(scale)
        }

        root
            .transition()
            .duration(transitionDuration) // milliseconds
            .call(zoom.transform, transform)
    }

    function zoomToNode(node, d, paddingPercent=0.75, transitionDuration=700) {
        /*
         * zoom to fit a particular node
         * this is different from scaling the container, because getBBox() does not account for translate() and scale()
        */
        if (zoomInProgress) {
            return;
        }

        // get the root svg offset
        // const offset = root.node().getBoundingClientRect()

        const transs = node.attr("transform");
        const trans = transs.substring(transs.indexOf("(")+1, transs.indexOf(")")).split(",");

        const domNode = node.node()
        // the bbox of the node (does not account for translate())
        const bbox = domNode.getBBox();
        // the SVGMatrix representing transforms needed to convert from viewport coords to local coords
        // const ctm = domNode.getCTM();

        // width, height of the node
        var width = bbox.width,
            height = bbox.height;

        // need to have container width and 
        const midX = trans[0]
        const midY = trans[1]

        if (width == 0 || height == 0) return; // nothing to fit

        const scale = paddingPercent * Math.min(fullWidth / width, fullHeight / height)
        const translate = [ -(midX*scale - fullWidth/2), -(midY*scale - fullHeight/2)];

        function transform() {
            return zoomIdentity
                .translate(translate[0], translate[1])
                .scale(scale)
        }

        root
            .transition()
            .duration(transitionDuration) // milliseconds
            .call(zoom.transform, transform)
    }

    return {
        zoomFit,
        zoomToNode,
    }
}

