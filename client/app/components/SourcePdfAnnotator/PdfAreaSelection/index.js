/* @flow */
import React, { Component } from 'react'
import getAreaAsPng from "../lib/getAreaAsPng";

import {
    getPageFromElement
} from '../lib/pdfjs-dom'

import TooltipWrapper from '../TooltipWrapper'
import SelectionTooltip from '../SelectionTooltip'
import MouseSelection from '../MouseSelection'

class PdfAreaSelection extends React.Component {
    /*
     * This allows annotation of a rectangle image
     */

    state = {
        position: null,
        ghostHighlight: null,
    }

    toggleTextSelection = (flag: boolean) => {
        /*
         * disables text selection and instead allows you to select an area
        */
        this.props.pdfViewer.viewer.classList.toggle(
            "PdfAnnotator--disable-selection",
            flag
        );
    }

    addHighlight = () => {

    }

    screenshot = (position: T_LTWH, pageNumber: number) => {
        const canvas = this.props.pdfViewer.getPageView(pageNumber - 1).canvas;

        return getAreaAsPng(canvas, position);
    }

    onSelection = (startTarget, boundingRect, resetSelection) => {
        /*
         * When an area is selected, store
         */
        const page = getPageFromElement(startTarget);

        if (!page) {
            return;
        }

        const pageBoundingRect = {
            ...boundingRect,
            top: boundingRect.top - page.node.offsetTop,
            left: boundingRect.left - page.node.offsetLeft
        };

        const viewportPosition = {
            boundingRect: pageBoundingRect,
            rects: [],
            pageNumber: page.number
        };

        const scaledPosition = this.props.viewportPositionToScaled(viewportPosition);

        const image = this.screenshot(pageBoundingRect, page.number);

        const ghostHighlight = {
            position: scaledPosition,
            content: { image },
        }

        const tooltipStyle = {
            left:
            page.node.offsetLeft + boundingRect.left + boundingRect.width / 2,
            top: boundingRect.top + page.node.offsetTop,
            bottom: boundingRect.top + page.node.offsetTop + boundingRect.height
        }

        this.setState({
            tooltipStyle,
            position: scaledPosition,
            ghostHighlight,
        })

        this.props.renderSelection(scaledPosition, ghostHighlight)
    }

    hideSelection = (e) => {
        this.setState({
            tooltipStyle: null,
            position: null,
            ghostHighlight: null,
        })
    }

    isAreaSelection = (event) => {
        return event.altKey && event.target instanceof HTMLElement && Boolean(event.target.closest(".page"))
    }

    render() {
        const { tooltipStyle, position } = this.state;
        const { pdfViewer } = this.props;

        const scrollTop = pdfViewer.container.scrollTop;

        return (
            <React.Fragment>
                {
                    position ?
                        <TooltipWrapper 
                            style={tooltipStyle} 
                            scrollTop={scrollTop} 
                            pageBoundingRect={position.boundingRect}
                            handleClickOutside={this.hideSelection}
                        >
                            <SelectionTooltip onConfirm={this.addHighlight} />
                        </TooltipWrapper>
                        : null
                }

            <MouseSelection
                onDragStart={() => this.toggleTextSelection(true)}
                onDragEnd={() => this.toggleTextSelection(false)}
                shouldStart={this.isAreaSelection}
                shouldRemain={position}
                onSelection={this.onSelection}
            />
            </React.Fragment>
        )
    }
}

export default PdfAreaSelection
