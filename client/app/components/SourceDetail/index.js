import React, { Component } from 'react'
import './styles.scss'

import testAnnotations from "./test-highlights";
import PdfViewer from '../SourcePdfViewer'
import PdfAnnotations from '../SourcePdfAnnotations'
import SourceLoader from '../SourceLoader'

class DerivedDocument extends React.Component {
    /*
     * A summary of a parent document
     */

    constructor(props) {
        super(props)
    }

    render() {
        const {  } = this.props

        return (
            <div className="derivedDocument">
            </div>
        )
    }
}

class SourcePDF extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const { source, highlights } = this.props

        console.log("we are loaded up")

        return (
            <div className="sourcePDF">
                <PdfViewer url={source.url} highlights={highlights} />
                <PdfAnnotations highlights={highlights} />
                <DerivedDocument />
            </div>
        )
    }
}

class SourceDetail extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { source, highlights } = this.props

        console.log(source, highlights)

        // const source = {
        //     type: "pdf",
        //     url: "https://arxiv.org/pdf/1708.08021.pdf",
        //     highlights: testAnnotations,
        // }

        let sourceComponent;

        switch(source.type) {
            case "application/pdf":
                sourceComponent = <SourcePDF source={source} highlights={highlights} />
        }

        return (
            <div className="sourceDetail">
                { sourceComponent }
            </div>
        )
    }
}

class SourceDetailView extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <SourceLoader id={this.props.match.params.id}>
                { (source, highlights) => (
                    <SourceDetail
                        source={source}
                        highlights={highlights}
                    />
                )}
            </SourceLoader>
            
        )
    }
}

export default SourceDetailView

