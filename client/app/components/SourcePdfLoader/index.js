/* @flow */
import React, { Component } from 'react'

import { PDFJS } from "pdfjs-dist";
import Spinner from '../Spinner'

class PdfLoader extends React.Component {
    /*
     * Loads a pdf document and passes it to its children
     */
    state = {
        pdfDocument: null,
        error: null,
    }

    componentDidMount() {
        const { url } = this.props;

        console.log("getting document!")
        PDFJS.getDocument(url)
            .then(pdfDocument => {
                console.log(pdfDocument)
                this.setState({
                    pdfDocument: pdfDocument
                });
            })
            .catch(error => {
                // TODO: handle error - 2018-05-02
                console.error(error)
            })
    }

    render() {
        const { children } = this.props;
        const { pdfDocument } = this.state;

        if (pdfDocument) {
            return children(pdfDocument)
        }

        // TODO: handle not found - 2018-05-02

        return <Spinner />
    }
}

export default PdfLoader
