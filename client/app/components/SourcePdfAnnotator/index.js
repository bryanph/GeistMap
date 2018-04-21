// based on https://github.com/agentcooper/react-pdf-annotator/blob/master/src/components/PdfAnnotator.js
import React, { Component } from 'react'

import { PDFJS } from "pdfjs-dist";

import MouseSelection from './MouseSelection'

PDFJS.disableWorker = true;

class PdfAnnotator extends React.Component {
    /*
     * Wraps a pdf document with annotation capabilities
     */
    constructor(props) {
        super(props)
    }

    enableAreaSelection = (event) => event.altKey

    render() {
        const {  } = this.props

        return (
            <div
                ref={node => (this.containerNode = node)}
                onMouseUp={() => setTimeout(this.onMouseUp, 0)}
                className="PdfAnnotator"
            >
                <h1>test</h1>
                <div className="PdfViewer" />
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
