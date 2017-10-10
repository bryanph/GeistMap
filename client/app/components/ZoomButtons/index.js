import React from 'react';
import { connect } from 'react-redux';
import { Button, Icon } from 'semantic-ui-react'
import classNames from 'classnames'

import './styles.scss'

class ZoomButtons extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { zoomFit, zoomIn, zoomOut } = this.props

        return (
            <div className="zoomButtons">
                { /*
                <Button 
                    circular icon={ "zoom" } size="big" className={ "zoomButtons-button" }
                    onClick={ zoomIn }
                />
                <Button 
                    circular icon={ "zoom out" } size="big" className={ "zoomButtons-button" }
                    onClick={ zoomOut }
                />
                */}
                {
                    /*
                    <Button 
                        circular icon={ "crop" } size="big" className={ "zoomButtons-button" }
                        onClick={ zoomFit }
                    />
                    */
                }
            </div>
        )
    }
}


export default ZoomButtons

