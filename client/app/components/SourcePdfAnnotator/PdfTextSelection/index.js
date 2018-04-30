/* @flow */
import React, { Component } from 'react'
import getAreaAsPng from "../lib/getAreaAsPng";

import { getPageFromRange } from '../lib/pdfjs-dom'
import getClientRects from '../lib/getClientRects.js'
import getBoundingRect from '../lib/getBoundingRect.js'

import TooltipWrapper from '../TooltipWrapper'
import SelectionTooltip from '../SelectionTooltip'
import MouseSelection from '../MouseSelection'

class PdfTextSelection extends React.Component {
    /*
     * This allows annotation of a rectangle image
     */

    state = {
        isCollapsed: true,
        range: null,
    }

    constructor(props) {
        super(props)

        this.containerRef = React.createRef();
    }

    addHighlight = () => {
        this.props.addHighlight(this.state.ghostHighlight)
        this.hideSelection()
    }

    componentDidMount() {
        document.addEventListener("selectionchange", this.onSelectionChange);
        document.addEventListener("keydown", this.handleKeyDown);

        this.props.containerNode.addEventListener("mouseup", this.onMouseUp);
    }

    componentWillUnmount() {
        document.removeEventListener("selectionchange", this.onSelectionChange);
        document.removeEventListener("keydown", this.handleKeyDown);

        this.props.containerNode.removeEventListener("mouseup", this.onMouseUp);
    }

    handleKeyDown = (event: KeyboardEvent) => {
        if (event.code === "Escape") {
            this.setState({})
        }
    };

    onSelectionChange = () => {
        const selection: Selection = window.getSelection();
        console.log("called onSelectionChange")

        if (selection.isCollapsed) {
            this.setState({ isCollapsed: true });
            return;
        }

        const range = selection.getRangeAt(0);

        if (!range) {
            return;
        }

        this.setState({
            isCollapsed: false,
            range,
        });
    };

    onMouseUp = () => {
        const { isCollapsed, range } = this.state

        if (!range || isCollapsed) {
            return;
        }

        const page = getPageFromRange(range);

        if (!page) {
            return;
        }

        const rects = getClientRects(range, page.node);

        if (rects.length === 0) {
            return;
        }

        const boundingRect = getBoundingRect(rects);

        const viewportPosition = { boundingRect, rects, pageNumber: page.number };

        const content = {
            text: range.toString()
        };

        const scaledPosition = this.props.viewportPositionToScaled(viewportPosition);

        const ghostHighlight = {
            position: scaledPosition,
            content,
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
    }

    hideSelection = (e) => {
        this.setState({
            isCollapsed: true,
            range: null,
            position: null,
            tooltipStyle: null,
        })

        // TODO: also remove the fake selection - 2018-04-27
    }

    onTooltipClick = () => {
        // make sure the text selection remains
        // https://stackoverflow.com/questions/37054885/keep-text-selected-when-focus-input

        // 1. take the selection and wrap a span around the selected content
        // 2. 
    }

    render() {
        const { tooltipStyle, position, range } = this.state;
        const { pdfViewer } = this.props;

        const scrollTop = pdfViewer.container.scrollTop;

        return (
            position ?
                <TooltipWrapper 
                    style={tooltipStyle} 
                    scrollTop={scrollTop} 
                    pageBoundingRect={position.boundingRect}
                    handleClickOutside={this.hideSelection}
                    onOpen={this.onTooltipClick}
                >
                    <SelectionTooltip onConfirm={this.addHighlight} />
                </TooltipWrapper>
                : null
        )
    }
}

export default PdfTextSelection

