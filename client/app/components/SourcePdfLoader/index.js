/* @flow */
import React, { Component } from 'react'

import { PDFJS } from "pdfjs-dist";
import Spinner from '../Spinner'

class PdfLoader extends React.Component {
    /*
     * Loads a pdf document and passes it to its children
     */
    state = {
        pdfDocument: null
    }

    componentDidMount() {
        const { url } = this.props;

        PDFJS.getDocument(url).then(pdfDocument => {
            this.setState({
                pdfDocument: pdfDocument
            });
        });
    }

    render() {
        const { children } = this.props;
        const { pdfDocument } = this.state;

        if (pdfDocument) {
            return children(pdfDocument)
        }

        return <Spinner />
    }
}

export default PdfLoader
