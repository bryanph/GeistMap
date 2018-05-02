import React, { Component } from 'react'

import PdfLoader from '../SourcePdfLoader'
import PdfAnnotator from '../SourcePdfAnnotator'

class PdfViewer extends React.Component {
    /*
     * Renders a PDF along with its highlights
     */

    constructor(props) {
        super(props)
    }

    render() {
        const { url, highlights } = this.props

        return (
            <PdfLoader url={url}>
                { pdfDocument => (
                    <PdfAnnotator
                        pdfDocument={pdfDocument}
                        highlights={highlights}
                    />
                )}
            </PdfLoader>

        )
    }
}

export default PdfViewer
