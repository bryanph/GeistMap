import React, { PropTypes } from 'react'

export const FeatureRowText = (props) => (
    <div className="featureRow-text">
        <h2 className="featureRow-header">{props.header}</h2>
        <p className="featureRow-body">{props.content}</p>
    </div>
    
)
export const FeatureRowImage = (props) => (
    <div className="featureRow-image">
        <img src={props.imageSrc} />
    </div>
)

export default class FeatureRow extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="featureRow">
                <FeatureRowText header={this.props.header} content={this.props.content} />
                <FeatureRowImage imageSrc={this.props.imageSrc} />
            </div>
        )
    }
}
