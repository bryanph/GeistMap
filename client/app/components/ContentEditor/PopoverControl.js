
import _ from 'lodash'
import React, { PropTypes } from 'react'

import styles from './styles.css';

// TODO: this is very similar to StyleButton - 2016-06-25
export const PopOverButton = (props) => {
    const className = classNames(
        'RichEditor-popOverButton', 
        { 'RichEditor-activeButton': props.active }
    )

    return (
        <span className={className} onMouseDown={(e) => {
            e.preventDefault(); props.onToggle(props.style) 
        }}>
            {props.label}
        </span>
    );
}
PopOverButton.propTypes = {
    style: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
}

class PopOverControl extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { currentInlineStyle, toggleInlineStyle } = this.props

        return (
       <div className="RichEditor-controls">
           {BLOCK_TYPES.map((type) =>
               <StyleButton
                   key={type.label}
                   active={type.style === blockType}
                   label={type.label}
                   onToggle={props.onToggle}
                   style={type.style}
               />
           )}
       </div>

       <div className="RichEditor-popOverControls">
           <StyleButton
                active={currentInlineStyle === 'LINK'}
                label={'Link'}
                onToggle={props.toggleInlineStyle}
                style={'LINK'}
            />
           <StyleButton
                active={currentInlineStyle === 'LINK'}
                label={'Link'}
                onToggle={props.toggleInlineStyle}
                style={'LINK'}
            />
       </div>

            
        )
    }
}
PopOverControl.propTypes = {
    toggleInlineStyle: React.PropTypes.func.isRequired,
    currentInlineStyle: React.PropTypes.object.isRequired,
}

