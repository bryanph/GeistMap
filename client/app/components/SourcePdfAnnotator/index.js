// based on https://github.com/agentcooper/react-pdf-annotator/blob/master/src/components/PdfAnnotator.js
import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import Popup from './Popup'
import Highlight from './Highlight'
import AreaHighlight from './AreaHighlight'
import MouseSelection from './MouseSelection'

import { scaledToViewport, viewportToScaled } from "./lib/coordinates";

// interface
import { PDFJS } from "pdfjs-dist";

// actually requires code for the pdf_viewer https://github.com/mozilla/pdf.js/
require("pdfjs-dist/web/pdf_viewer");
import "pdfjs-dist/web/pdf_viewer.css";
import './styles.scss'


PDFJS.disableWorker = true;

const HighlightPopup = ({ comment }) =>
    comment.text ? (
        <div className="Highlight__popup">
            {comment.emoji} {comment.text}
        </div>
    ) : null;

class PdfAnnotationTooltip extends React.Component {
    /*
     * Reused per annotation. It hovers over the annotation to show a label.
     */
    constructor(props) {
        super(props)
    }

    render() {
        const { annotation } = this.props

        return (
            <div className="PdfAnnotator__tip-layer">
            </div>
        )
    }
}

class PdfAnnotation extends React.Component {
    /*
     * A single annotation
     */
    constructor(props) {
        super(props)
    }

    showTip = (popUpContent) => {
        const { highlight } = this.props

        this.props.showTip(highlight);
    }

    hideTip = () => {
        // hide the tooltip for this annotation
        this.props.hideTip();
    }

    render() {
        const { highlight } = this.props

        const scaledPosition = this.props.scaledPositionToViewport(highlight.position)

        console.log("rendering a highlight", highlight)

        // TODO: should not happen here - 2018-04-24
        // if (tip && tip.highlight.id === String(highlight.id)) {
        //     // should highlight the annotation
        //     this.showTip(tip.highlight, tip.callback(viewportHighlight));
        // }

        // const isScrolledTo = Boolean(
        //     scrolledToHighlightId === highlight.id
        // );

        const isTextHighlight = !Boolean(
            highlight.content && highlight.content.image
        );

        console.log(isTextHighlight)

        const component = isTextHighlight ? (
            <Highlight
                isScrolledTo={false}
                position={highlight.position}
                comment={highlight.comment}
            />
        ) : (
            <AreaHighlight
                highlight={highlight}
                onChange={boundingRect => {
                    this.updateHighlight(
                        highlight.id,
                        { boundingRect: this.props.viewportToScaled(boundingRect) },
                        { image: this.props.screenshot(boundingRect) }
                    );
                }}
            />
        );

        // TODO: Don't render this for every popup. Instead, have one component and move it around. - 2018-04-24
        return (
            <Popup
                popupContent={<HighlightPopup {...highlight} />}
                onMouseOver={this.showTip}
                onMouseOut={this.hideTip}
                children={component}
            />
        );
    }
}

class PdfAnnotationLayerPage extends React.Component {
    /*
     * An annotation layer overlay for a given PDF page
     */
    constructor(props) {
        super(props)
    }

    viewportToScaled = (rect) => {
        const { pageNumber } = this.props
        const viewport = this.props.pdfViewer.getPageView(pageNumber - 1).viewport;

        return viewportToScaled(rect, viewport);
    }

    scaledPositionToViewport = ({
        pageNumber,
        boundingRect,
        rects,
        usePdfCoordinates
    }: T_ScaledPosition): T_Position => {
        const viewport = this.props.pdfViewer.getPageView(pageNumber - 1).viewport;

        return {
            boundingRect: scaledToViewport(boundingRect, viewport, usePdfCoordinates),
            rects: (rects || []).map(rect =>
            scaledToViewport(rect, viewport, usePdfCoordinates)
        ),
            pageNumber
        };
    }

    viewportPositionToScaled = ({
        pageNumber,
        boundingRect,
        rects
    }: T_Position): T_ScaledPosition => {
        const viewport = this.props.pdfViewer.getPageView(pageNumber - 1).viewport;

        return {
            boundingRect: viewportToScaled(boundingRect, viewport),
            rects: (rects || []).map(rect => viewportToScaled(rect, viewport)),
            pageNumber
        };
    }


    screenshot = (rect) => {
        const { pageNumber } = this.props

        return this.props.screenshot(rect, pageNumber)
    }

    render() {
        const { highlights } = this.props

        return (
            <div className="PdfAnnotator__highlight-layer">
                {(highlights).map(
                    (highlight, index) => {
                        return (
                            <PdfAnnotation 
                                key={index} 
                                highlight={highlight}
                                viewportToScaled={this.viewportToScaled}
                                scaledPositionToViewport={this.scaledPositionToViewport}
                                screenshot={this.screenshot}
                            />
                        )
                    }
                )}
            </div>
        )
    }
}

class PdfAnnotationLayer extends React.Component {
    /*
     * This annotation layer is rendered as a portal over the pdfjs textlayer div.
     * must be rendered separately for every page in the pdf
     * // TODO: don't render all at once, only once that are in the view - 2018-04-24
     */
    constructor(props) {
        super(props)
    }

    groupHighlightsByPage(highlights) {
        // TODO: what is this? - 2018-04-24
        // const { ghostHighlight } = this.props;

        return highlights
            .filter(Boolean)
            .reduce((acc, highlight) => {
                const { pageNumber } = highlight.position;

                acc[pageNumber] = acc[pageNumber] || [];
                acc[pageNumber].push(highlight);

                return acc;
            }, {});
    }

    render() {
        const {
            pdfDocument,
            pdfViewer,
            highlights,
        } = this.props

        if (!pdfViewer) {
            return null;
        }

        const highlightsByPage = this.groupHighlightsByPage(highlights);

        return _.range(1, pdfDocument.numPages).map((pageNumber, index) => {

            const textLayer = pdfViewer.getPageView(pageNumber - 1).textLayer;

            if (!textLayer) {
                return null;
            }

            return ReactDOM.createPortal(
                <PdfAnnotationLayerPage
                    key={index}
                    pdfViewer={pdfViewer}
                    highlights={highlightsByPage[String(pageNumber)] || []}
                />
                , textLayer.textLayerDiv
            )
        })
    }
}

class PdfAnnotator extends React.Component {
    /*
     * Wraps a pdf document with annotation capabilities
     * This adds two layers over the document:
     * - A tooltip layer: for showing the tooltip
     * - An annotation layer: for overlaying the annotations over the document
     * 
     * Possible improvements:
     * - don't render all highlights simultaneously but just the ones that are visible (within range)
     * - Add react-virtualized for the annotation layer (https://www.youtube.com/watch?v=aV1271hd9ew)
     */
    state = {
        // selection information
        isCollapsed: true,
        range: null,

        ghostHighlight: null,
        scrolledToHighlightId: null,
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

    onDocumentReady = () => {
        /*
         * If an annotation is focused in the URL, scroll to that annotation
         */
        // const { scrollRef } = this.props;

        // this.pdfViewer.currentScaleValue = "auto";

        // scrollRef(this.scrollTo);
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

    removeScrollFocus = () => {
        const { onScrollChange } = this.props;

        onScrollChange();

        this.setState(
            {
                scrolledToHighlightId: EMPTY_ID
            },
            () => this.renderHighlights()
        );

        this.pdfViewer.container.removeEventListener("scroll", this.removeScrollFocus);
    };

    scrollTo = (highlight: T_Highlight) => {
        const { pageNumber, boundingRect, usePdfCoordinates } = highlight.position;

        this.pdfViewer.container.removeEventListener("scroll", this.removeScrollFocus);

        const pageViewport = this.pdfViewer.getPageView(pageNumber - 1).viewport;

        const scrollMargin = 10;

        this.pdfViewer.scrollPageIntoView({
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
            this.pdfViewer.container.addEventListener("scroll", this.onScroll);
        }, 100);
    };

    hideTipAndSelection = () => {
        const tipNode = findOrCreateContainerLayer(
            this.pdfViewer.viewer,
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
            node: this.pdfViewer.getPageView(pageNumber - 1).div
        };

        const pageBoundingRect = page.node.getBoundingClientRect();

        const tipNode = findOrCreateContainerLayer(
            this.pdfViewer.viewer,
            "PdfAnnotator__tip-layer"
        );

        ReactDom.render(
            <TipContainer
                scrollTop={this.pdfViewer.container.scrollTop}
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

    // shouldComponentUpdate(nextProps) {
    //     if (this.props.highlights !== nextProps.highlights) {
    //         return true
    //     }

    //     return false;
    // }

    onTextLayerRendered = () => {
        this.setState({ textLayerRendered: true })
    };

    componentDidMount() {
        const { pdfDocument } = this.props;

        this.linkService = new PDFJS.PDFLinkService();

        this.pdfViewer = new PDFJS.PDFViewer({
            container: this.containerNode,
            enhanceTextSelection: true,
            removePageBorders: true,
            linkService: this.linkService
        });

        this.pdfViewer.setDocument(pdfDocument);
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
        const {  } = this.props;
        const { textLayerRendered } = this.state;

        return (
            <div
                ref={node => (this.containerNode = node)}
                onMouseUp={() => setTimeout(this.onMouseUp, 0)}
                className="PdfAnnotator"
            >
                <div className="pdfViewer" />
                {
                    textLayerRendered ?
                        <PdfAnnotationLayer 
                            pdfDocument={this.props.pdfDocument}
                            pdfViewer={this.pdfViewer}
                            highlights={this.props.highlights}
                        />
                        : null
                }
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
