import React, { Component } from 'react'

class PdfAnnotations extends React.Component {
    /*
     * A view which shows PDF annotations in order of occurrence
     */
    constructor(props) {
        super(props)
    }

    render() {
        const { annotations } = this.props

        return (
            <div className="pdfAnnotations">
            </div>
        )
    }
}

export default PdfAnnotations
