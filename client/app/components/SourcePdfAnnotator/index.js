// based on https://github.com/agentcooper/react-pdf-annotator/blob/master/src/components/PdfAnnotator.js
import React, { Component } from 'react'

// interface
import { PDFJS } from "pdfjs-dist";

// actually requires code for the pdf_viewer https://github.com/mozilla/pdf.js/
require("pdfjs-dist/web/pdf_viewer");
import "pdfjs-dist/web/pdf_viewer.css";
import './styles.scss'

import MouseSelection from './MouseSelection'

PDFJS.disableWorker = true;

class PdfAnnotator extends React.Component {
    /*
     * Wraps a pdf document with annotation capabilities
     */
    state = {
        // selection information
        isCollapsed: true,
        range: null,

        ghostHighlight: null,
        scrolledToHighlightId: EMPTY_ID
    };

    enableAreaSelection = (event) => event.altKey

    onSelectionChange = () => {
        const selection: Selection = window.getSelection();

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
            range
        });
    };

    removeScrollFocus = () => {
        const { onScrollChange } = this.props;

        onScrollChange();

        this.setState(
            {
                scrolledToHighlightId: EMPTY_ID
            },
            () => this.renderHighlights()
        );

        this.viewer.container.removeEventListener("scroll", this.removeScrollFocus);
    };

    scrollTo = (highlight: T_Highlight) => {
        const { pageNumber, boundingRect, usePdfCoordinates } = highlight.position;

        this.viewer.container.removeEventListener("scroll", this.removeScrollFocus);

        const pageViewport = this.viewer.getPageView(pageNumber - 1).viewport;

        const scrollMargin = 10;

        this.viewer.scrollPageIntoView({
            pageNumber,
            destArray: [
                null,
                { name: "XYZ" },
                ...pageViewport.convertToPdfPoint(
                    0,
                    scaledToViewport(boundingRect, pageViewport, usePdfCoordinates).top -
                    scrollMargin
                ),
                0
            ]
        });

        this.setState(
            {
                scrolledToHighlightId: highlight.id
            },
            () => this.renderHighlights()
        );

        // after scrolling, when the user scrolls; unfocus the annotation
        setTimeout(() => {
            this.viewer.container.addEventListener("scroll", this.onScroll);
        }, 100);
    };
    onDocumentReady = () => {
        /*
         * If an annotation is focused in the URL, scroll to that annotation
         */
        const { scrollRef } = this.props;

        this.viewer.currentScaleValue = "auto";

        scrollRef(this.scrollTo);
    };

    handleKeyDown = (event: KeyboardEvent) => {
        if (event.code === "Escape") {
            this.hideTipAndSelection();
        }
    }

    onMouseDown = (event: MouseEvent) => {
        /*
         * When clicking somewhere outside the tooltip, close it
         */
        if (!(event.target instanceof HTMLElement)) {
            return;
        }

        if (event.target.closest(".PdfAnnotator__tip-container")) {
            return;
        }

        this.hideTipAndSelection();

        // let single click go through
        clickTimeoutId = setTimeout(
            () => this.setState({ isMouseDown: true }),
            CLICK_TIMEOUT
        );
    };

    onMouseUp = () => {
        clearTimeout(clickTimeoutId);
        this.setState({ isMouseDown: false });

        const { onSelectionFinished } = this.props;
        const { isCollapsed, range } = this.state;
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

        const scaledPosition = this.viewportPositionToScaled(viewportPosition);

        this.renderTipAtPosition(
            viewportPosition,
            onSelectionFinished(
                scaledPosition,
                content,
                () => this.hideTipAndSelection(),
                () =>
                this.setState(
                    {
                        ghostHighlight: { position: scaledPosition }
                    },
                    () => this.renderHighlights()
                )
            )
        );
    };

    hideTipAndSelection = () => {
        const tipNode = findOrCreateContainerLayer(
            this.viewer.viewer,
            "PdfAnnotator__tip-layer"
        );

        ReactDom.unmountComponentAtNode(tipNode);

        this.setState({ ghostHighlight: null, tip: null }, () =>
            this.renderHighlights()
        );
    };


    renderTipAtPosition(position: T_Position, inner: ?React$Element<*>) {
        const { boundingRect, pageNumber } = position;

        const page = {
            node: this.viewer.getPageView(pageNumber - 1).div
        };

        const pageBoundingRect = page.node.getBoundingClientRect();

        const tipNode = findOrCreateContainerLayer(
            this.viewer.viewer,
            "PdfAnnotator__tip-layer"
        );

        ReactDom.render(
            <TipContainer
                scrollTop={this.viewer.container.scrollTop}
                pageBoundingRect={pageBoundingRect}
                style={{
                    left:
                    page.node.offsetLeft + boundingRect.left + boundingRect.width / 2,
                    top: boundingRect.top + page.node.offsetTop,
                    bottom: boundingRect.top + page.node.offsetTop + boundingRect.height
                }}
                children={inner}
            />,
            tipNode
        );
    }

    shouldComponentUpdate() {
        // not a react-managed component
        return false;
    }

    componentDidMount() {
        const { pdfDocument } = this.props;

        this.linkService = new PDFJS.PDFLinkService();

        this.viewer = new PDFJS.PDFViewer({
            container: this.containerNode,
            enhanceTextSelection: true,
            removePageBorders: true,
            linkService: this.linkService
        });

        this.viewer.setDocument(pdfDocument);
        this.linkService.setDocument(pdfDocument);

        // debug
        window.PdfViewer = this;

        document.addEventListener("selectionchange", this.onSelectionChange);
        document.addEventListener("keydown", this.handleKeyDown);

        this.containerNode.addEventListener("pagesinit", this.onDocumentReady);
        this.containerNode.addEventListener("textlayerrendered", this.onTextLayerRendered);
        this.containerNode.addEventListener("mousedown", this.onMouseDown);
    }

        componentWillUnmount() {
            document.removeEventListener("selectionchange", this.onSelectionChange);
            document.removeEventListener("keydown", this.handleKeyDown);

            this.containerNode.removeEventListener("textlayerrendered", this.onTextLayerRendered);
            this.containerNode.removeEventListener("mousedown", this.onMouseDown);
        }

    render() {
        const {  } = this.props

        console.log("called")

        return (
            <div
                ref={node => (this.containerNode = node)}
                onMouseUp={() => setTimeout(this.onMouseUp, 0)}
                className="PdfAnnotator"
            >
                <h1>test</h1>
                <div className="pdfViewer" />
                {
                    /*
                <MouseSelection
                    onDragStart={() => this.toggleTextSelection(true)}
                    onDragEnd={() => this.toggleTextSelection(false)}
                    onChange={isVisible =>
                            this.setState({ isAreaSelectionInProgress: isVisible })
                    }
                    shouldStart={event =>
                            this.enableAreaSelection(event) &&
                                event.target instanceof HTMLElement &&
                                Boolean(event.target.closest(".page"))
                    }
                    onSelection={(startTarget, boundingRect, resetSelection) => {
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

                        const scaledPosition = this.viewportPositionToScaled(
                            viewportPosition
                        );

                        const image = this.screenshot(pageBoundingRect, page.number);

                        this.renderTipAtPosition(
                            viewportPosition,
                            onSelectionFinished(
                                scaledPosition,
                                { image },
                                () => this.hideTipAndSelection(),
                                () =>
                                this.setState(
                                    {
                                        ghostHighlight: {
                                            position: scaledPosition,
                                            content: { image }
                                        }
                                    },
                                    () => {
                                        resetSelection();
                                        this.renderHighlights();
                                    }
                                )
                            )
                        );
                    }}
                />
                */
                }

            </div>
        )
    }
}

export default PdfAnnotator
