/**
*
* EditableTitle
*
*/

import React, { PropTypes } from 'react';
import enhanceWithClickOutside from 'react-onclickoutside'
import { DebouncedTextField } from '../../components/Input'

import { controlled, debounced } from '../../components/Input'
import Textarea from 'react-autosize-textarea'
var TextareaAutosize = require('react-autosize-textarea');

import './styles.css'
// export const InputText = (props) => (
//     <Textarea 
//         type='text' {...props} 
//         ref={(input) => {
//             if (input) {
//                 console.log(input.refs.textarea);
//                 input.refs.textarea.select()
//             }
//         }}
//         className="EditableTitle-input" 
//     />
// )
class InputText extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.input.select()
    }

    render() {
        const {  } = this.props

        return (
            // TODO: why does this ref callback keep getting called? - 2016-08-23
            <Textarea 
                type='text' {...this.props} 
                ref={(input) => {
                    if (input) {
                        this.input = input.refs.textarea
                    }
                }}
                className="EditableTitle-input" 
            />
            
        )
    }
}
InputText.propTypes = {
    
}


const DebouncedInput = debounced(controlled(InputText))

class EditableTitle extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            editable: false,
            value: { name: props.title }
        }

        this.onClick = this.onClick.bind(this)
        this.onChange = this.onChange.bind(this)
        this.onDebouncedChange = this.onDebouncedChange.bind(this)
        this.onKeyPress = this.onKeyPress.bind(this)
        this.handleClickOutside = this.handleClickOutside.bind(this)
    }

    componentWillUpdate(nextProps) {
        if (this.props.title !== nextProps.title) {
            this.setState({ value: { name: nextProps.title } })
        }
    }

    onClick(e) {
        this.setState({ editable: true }, () => {
            console.log(this.refs.input);
            // this.refs.input.select()
        })
    }

    onChange(e) {
        this.setState({ value: { name: e.target.value }})
    }

    onDebouncedChange(e) {
        if (e.target.value) {
            this.props.updateNode({
                name: e.target.value
            })
        }
    }

    onKeyPress(e) {
        if (e.keyCode === 13) { // enter
            // TODO: make sure to cancel debounced onChange - 2016-07-26
            if (this.state.value.name) {
                this.props.updateNode(this.state.value)
            }
            this.setState({ editable: false })
            this.refs.input.cancel()
        }
        else if (e.keyCode === 27) { // esc
            // TODO: make sure to cancel debounced onChange - 2016-07-26
            this.setState({ editable: false })
            this.refs.input.cancel()
        }
    }

    handleClickOutside() {
        // if (!this.state.value.name) {
        //     this.refs.input.cancel()
        // }
        this.setState({ editable: false })
    }

    render() {
        const { editable } = this.state

        return (
            <div className="EditableTitle" onClick={this.onClick}>
                {
                    editable ?
                        <DebouncedInput
                            ref="input"
                            value={this.state.value.name}
                            style={{width: '100%', fontWeight: 700}}
                            onChange={this.onChange}
                            debouncedOnChange={this.onDebouncedChange}
                            onKeyDown={this.onKeyPress}
                            autoFocus
                        />
                        : <h1 style={{wordWrap: 'break-word'}}>{this.state.value.name}</h1>
                }

            </div>
            
        )
    }
}
EditableTitle.propTypes = {
    title: PropTypes.string.isRequired,
    updateNode: PropTypes.func.isRequired,
}

export default enhanceWithClickOutside(EditableTitle);
