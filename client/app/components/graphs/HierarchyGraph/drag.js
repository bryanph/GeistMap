import {
    event as currentEvent,
    selectAll as d3SelectAll,
    select as d3Select,
    mouse as currentMouse,
} from 'd3-selection'

import { NODE_RADIUS } from '../constants'

import getTranslate from '../getTranslate.js'

const PAN_BOUNDARY = 20; // Within 20px from edges will pan when dragging.
const PAN_SPEED = 200;

export default () => (actions) => {

    function isRoot(d) {
        if (d.type === "root") {
            return true;
        }
        return false;
    }

    let panInProgress = false;
    let panTimer = null;

    // TODO: Pan function, can be better implemented.
    function pan(domNode, direction) {
        if (panInProgress) {
            clearTimeout(panTimer);
            translateCoords = d3.transform(svgGroup.attr("transform"));

            if (direction == 'left' || direction == 'right') {
                translateX = direction == 'left' ? translateCoords.translate[0] + PAN_SPEED : translateCoords.translate[0] - PAN_SPEED;
                translateY = translateCoords.translate[1];
            } else if (direction == 'up' || direction == 'down') {
                translateX = translateCoords.translate[0];
                translateY = direction == 'up' ? translateCoords.translate[1] + PAN_SPEED : translateCoords.translate[1] - PAN_SPEED;
            }
            scaleX = translateCoords.scale[0];
            scaleY = translateCoords.scale[1];
            scale = zoomListener.scale();
            svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
            d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
            zoomListener.scale(zoomListener.scale());
            zoomListener.translate([translateX, translateY]);
            panTimer = setTimeout(function() {
                pan(domNode, PAN_SPEED, direction);
            }, 50);
        }
    }

    function panDrag(d) {
        /*
         * When the mouse moves to the edge of the graph, pan towards the mouse
         */
        // get coords of mouseEvent relative to svg container to allow for panning
        const relCoords = currentMouse(root);
        if (relCoords[0] < PAN_BOUNDARY) {
            panInProgress = true;
            pan(this, 'left');
        } else if (relCoords[0] > ($('svg').width() - PAN_BOUNDARY)) {

            panInProgress = true;
            pan(this, 'right');
        } else if (relCoords[1] < PAN_BOUNDARY) {
            panInProgress = true;
            pan(this, 'up');
        } else if (relCoords[1] > ($('svg').height() - PAN_BOUNDARY)) {
            panInProgress = true;
            pan(this, 'down');
        } else {
                clearTimeout(panTimer);
        }


    }

    let panInProgress = false;
    let dragStarted = false;
    let startX = null
    let startY = null;

    return {
        dragstart: function(d) {
            /*
             * Freeze the graph
             */
            if (isRoot(d)) {
                return;
            }

            dragStarted = true;
            startX = currentEvent.x;
            startY = currentEvent.y;

            // const nodeSelection = d3SelectAll('.node')
            // nodeSelection.each(node => {
            //     node.fx = node.x
            //     node.fy = node.y
            // })

            currentEvent.sourceEvent.stopPropagation();
        },
        drag: function(d) {
            if (isRoot(d)) {
                return;
            }

            // first just move ...
            d.fx = currentEvent.x;
            d.fy = currentEvent.y;

            const nodeSelection = d3SelectAll('.node')

            const prevHoveredNodes = d3SelectAll('.node-hovered')

            // back to their default color again
            prevHoveredNodes.select('circle')
            prevHoveredNodes.classed('node-hovered', false)

            nodeSelection.each(node => {
                if (node === d) return

                const distanceToNode = Math.sqrt((node.x - d.x)**2 + (node.y - d.y)**2)

                if (distanceToNode < node.radius) {
                    // change background color
                    d3Select(`#node-${node.id}`)
                        .classed('node-hovered', true)
                        .select('circle')
                }
            })
        },
        dragend: function(d) {
            /*
             * Create an edge to all nodes which are being hovered over
             */
            const nodeSelection = d3SelectAll('.node')

            d.fx = null;
            d.fy = null;

            // if we only moved the mouse in a square of 8px, assume it was a click instead of a drag
            const dx = Math.abs(startX - currentEvent.x)
            const dy = Math.abs(startY - currentEvent.y)
            if (dx < 8 && dy < 8) {
                nodeSelection.each(node => {
                    node.fx = null
                    node.fy = null
                })

                // TODO: call the click action instead - 2017-07-16
                return
            }

            const prevHoveredNodes = d3SelectAll('.node-hovered')
            // back to their default color again
            prevHoveredNodes.select('circle')
            prevHoveredNodes.classed('node-hovered', false)

            nodeSelection.each(node => {
                // undo fixed state as set in dragstart
                node.fx = null
                node.fy = null

                if (node === d) return

                const distanceToNode = Math.sqrt((node.x - d.x)**2 + (node.y - d.y)**2)

                if (distanceToNode < node.radius) {
                    // move this node to the abstraction that is hovered over
                    // TODO: need a method for getting the currently visible abstraction chain
                    return actions.moveToAbstraction(
                        this.props.activeCollection.id,
                        d.id,
                        node.id,
                    )
                }
            })
        }
    }

