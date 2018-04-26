import React, { Component } from 'react'

class PdfAnnotationTooltip extends React.Component {
    /*
     * Reused per annotation. It hovers over the annotation to show a label.
     */

    constructor(props) {
        super(props)
    }

    onConfirm(comment) {
        /*
         * Add a highlight
        */
        this.props.addHighlight({ content, position, comment });

        this.props.hideTipAndSelection();
    }

    render() {
        const {
            isVisible,
            annotation,
            position,
        } = this.props

        if (!isVisible) {
            return null;
        }

        const pageNode = this.props.pageViewer.getPageView(pageNumber - 1).div
        const pageBoundingRect = pageNode.getBoundingClientRect();
        const scrollTop = this.props.pageViewer.scrollTop

        const style = {
            left: pageNode.offsetLeft + boundingRect.left + boundingRect.width / 2,
            top: boundingRect.top + pageNode.offsetTop,
            bottom: boundingRect.top + pageNode.offsetTop + boundingRect.height
        }

        return (
            <div className="PdfAnnotator__tip-layer">
            </div>
        )
    }
}

export default PdfAnnotationTooltip
