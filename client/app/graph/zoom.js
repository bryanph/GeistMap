import { zoom as d3Zoom, zoomIdentity, interpolate } from 'd3-zoom'
import { event as currentEvent, } from 'd3-selection'


const setCTM = (element, m) => element.transform.baseVal.initialize(element.ownerSVGElement.createSVGTransformFromMatrix(m))

export default (root, container, fullWidth, fullHeight) => {

    const center = [ fullWidth / 2, fullHeight / 2 ]

    let zoomInProgress = false

    const zoom = d3Zoom()
        .scaleExtent([1/2, 8])
        .on('start', () => zoomInProgress = true)
        .on('end', () => zoomInProgress = false)
        .on('zoom', function () {
            container.attr("transform", currentEvent.transform)
        })

    // to allow for free zooming
    root.call(zoom)

    function getTranslate(node) {
        console.log(node)
        console.log(node.attr("transform").split(' '))
        const transs = node.attr("transform").split(' ');

        const translate = transs[0].substring(transs[0].indexOf("(")+1, transs[0].indexOf(")")).split(",").map(parseFloat);
        const scale = transs[1] ? parseFloat(transs[1].substring(transs[1].indexOf("(")+1, transs[1].indexOf(")"))) : 1

        return [
            ...translate,
            scale
        ]
    }

    function zoomClick(dir) {
        const direction = dir
        const factor = 0.3
        const center = [fullWidth / 2, fullHeight / 2]
        const extent = zoom.scaleExtent()
        const currentTranslate = getTranslate(container)
        const scale = currentTranslate[2]
        const view = { x: currentTranslate[0], y: currentTranslate[1], k: scale }

        const targetZoom = scale * (1 + factor * direction)

        if (targetZoom < extent[0] || targetZoom > extent[1]) {
            return false;
        }

        // calculate actual position with translate
        const translate = [ (center[0] - view.x) / view.k, (center[1] - view.y) / view.k ]

        // calculate offsets
        const l = [ translate[0] * targetZoom + view.x, translate[1] * view.k + view.y ]

        // new center coordinates
        const newX = view.x + center[0] - l[0]
        const newY = view.y + center[1] - l[1]

        function transform() {
            return zoomIdentity
                .translate(newX, newY)
                .scale(targetZoom)
        }

        root
            .transition()
            .duration(300) // milliseconds
            .call(zoom.transform, transform)
    }

    function zoomIn() {
        zoomClick(1)
    }

    function zoomOut() {
        zoomClick(-1)
    }

    function zoomFit() {
        /*
         * Zoom to fit to the root node
        */
        if (zoomInProgress) {
            return;
        }

        const paddingPercent = 0.8
        const transitionDuration = 1000

        const bbox = container.node().getBBox();

        // width, height of the node
        var width = bbox.width,
            height = bbox.height;

        // need to have container width and 
        var midX = bbox.x + width/2,
            midY = bbox.y + height/2;

        if (width == 0 || height == 0) return; // nothing to fit

        let scale = paddingPercent * Math.min(fullWidth / width, fullHeight / height)

        if (scale > 1) {
            // scale = 1;
            return;
        }

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

        const trans = getTranslate(node)

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
        zoomIn,
        zoomOut,
    }
}

