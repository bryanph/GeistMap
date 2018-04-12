/**
*
* EditableTitle
*
*/

import React from 'react';
import enhanceWithClickOutside from 'react-onclickoutside'
import { controlled, debounced } from '../../components/Input'

import './styles.css'

class InputText extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.textarea.select()
    }

    render() {
        return (
            <textarea
                {...this.props}
                rows="1"
                ref={(ref) => { this.textarea = ref }}
                className="EditableTitle-input" 
            />
        )
    }
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
                            onChange={this.onChange}
                            debouncedOnChange={this.onDebouncedChange}
                            onKeyDown={this.onKeyPress}
                            autoFocus
                        />
                        : <h1 className="EditableTitle-h1">{this.state.value.name}</h1>
                }

            </div>
        )
    }
}

export default enhanceWithClickOutside(EditableTitle);
