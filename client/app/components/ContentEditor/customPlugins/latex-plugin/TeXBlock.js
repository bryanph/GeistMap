'use strict';

import katex from 'katex';
import React from 'react';
import {Entity} from 'draft-js';
import TextareaAutosize from 'react-autosize-textarea'

class KatexOutput extends React.Component {
    constructor(props) {
        super(props);
        this._timer = null;
    }

    _update(nextProps) {
        if (this._timer) {
            clearTimeout(this._timer);
        }

        let value = nextProps.content

        if (!nextProps.inline && value && !value.startsWith('\\begin{aligned}')) {
            value = '\\begin{aligned}' + value + '\\end{aligned}'
        }

        if (value) {
            this._timer = setTimeout(() => {
                katex.render(
                    value,
                    this.refs.container,
                    {displayMode: !nextProps.inline}
                );
            }, 0);
        }
    }

    componentDidMount() {
        this._update(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.content !== this.props.content) {
            this._update(nextProps);
        }
    }

    componentWillUnmount() {
        clearTimeout(this._timer);
        this._timer = null;
    }

    render() {
        return (
            this.props.inline ?
                <span ref="container" onClick={this.props.onClick} />
            :
                <div ref="container" onClick={this.props.onClick} />
        )
    }
}

export default class TeXBlock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {editMode: false, invalidTeX: true};

        this._onClick = () => {
            if (this.state.editMode) {
                return;
            }

            this.setState({
                editMode: true,
                texValue: this._getValue(),
            }, () => {
                    this._startEdit();
                });


        };

        this._onKeyPress = evt => {
            if (evt.keyCode === 13 && !evt.shiftKey) {
                evt.preventDefault()
                evt.stopPropagation()
                return this._save()
            }
        }

        this._onValueChange = evt => {
            const value = evt.target.value;
            let invalid = false;

            if (!value) {
                invalid = true
            }

            try {
                let toParse = value;
                if (!this.props.inline && value && !value.startsWith('\\begin{aligned}')) {
                    toParse = '\\begin{aligned}' + value + '\\end{aligned}'
                }

                katex.__parse(toParse);
            } catch (e) {
                invalid = true;
            } finally {
                this.setState({
                    invalidTeX: invalid,
                    texValue: value,
                    // editMode: true,
                });

                if (!invalid) {
                    this.setState({ lastTexValue: value })
                }

                const onUpdate = this.props.onUpdate || this.props.blockProps.onUpdate
                onUpdate()
            }
        };

        this._save = () => {
            if (this.state.invalidTeX) {
                return;
            }

            var entityKey = this.props.entityKey || this.props.block.getEntityAt(0);
            Entity.mergeData(entityKey, {content: this.state.texValue, initial: false});
            this.setState({
                invalidTeX: false,
                editMode: false,
                texValue: null,
            }, this._finishEdit);
        };

        this._remove = () => {
            const onRemove = this.props.onRemove || this.props.blockProps.onRemove
            onRemove(this.props.entityKey || this.props.block.getKey(), this.props.inline);
        };
        this._startEdit = () => {
            console.log(this.textarea);
            setTimeout(() => this.textarea.focus(), 0)
            const onStartEdit = this.props.onStartEdit || this.props.blockProps.onStartEdit
            onStartEdit(this.props.entityKey || this.props.block.getKey(), this.props.inline);
        };
        this._finishEdit = () => {
            const onFinishEdit = this.props.onFinishEdit || this.props.blockProps.onFinishEdit
            onFinishEdit(this.props.entityKey || this.props.block.getKey(), this.props.inline);
        };
    }

    componentDidMount() {
        // simulate a click when first creating the block.
        const value = this._getValue() 

        this._onValueChange({ target: { value  }})

        if (this._getValue('initial')) {
            this._onClick();
        }

    }

    _getValue(key) {
        let entityKey;
        try {
            entityKey = Entity .get(this.props.entityKey || this.props.block.getEntityAt(0))
        }
        catch(error) {
            console.error(entityKey + " not found", this.props)
            return null;
        }


        return entityKey.getData()[key || 'content'];
    }

    getData() {
        let entityKey;
        try {
            entityKey = Entity .get(this.props.entityKey || this.props.block.getEntityAt(0))
        }
        catch(error) {
            console.error(entityKey + " not found", this.props)
            return null;
        }

        return entityKey.getData()
    }

    render() {
        // const { blockProps: {  inline } } = this.props
        const inline = this.props.inline // only set on inline components

        var texContent = null;
        if (this.state.editMode) {
            if (this.state.invalidTeX) {
                // texContent = '';
                texContent = this.state.lastTexValue;
            } else {
                texContent = this.state.texValue;
            }
        } else {
            texContent = this._getValue();
        }

        var className = !inline ? 'TeXEditor-tex' : 'TeXEditor-inline-tex'
        if (this.state.editMode) {
            className += ' TeXEditor-activeTeX';
        }

        var editPanel = null;
        if (this.state.editMode) {
            var buttonClass = 'TeXEditor-saveButton';
            if (this.state.invalidTeX) {
                buttonClass += ' TeXEditor-invalidButton';
            }

            editPanel =
                <div className="TeXEditor-panel">
                    <TextareaAutosize
                        className="TeXEditor-texValue"
                        onKeyDown={this._onKeyPress}
                        onChange={this._onValueChange}
                        innerRef={(ref) => this.textarea = ref}
                        placeholder="Fill in TeX here..."
                        value={this.state.texValue}
                    />
                    <div className="TeXEditor-buttons">
                        <button
                            className={buttonClass}
                            disabled={this.state.invalidTeX}
                            onClick={this._save}>
                            {this.state.invalidTeX ? 'Invalid TeX' : 'Done'}
                        </button>
                        {
                            // TODO: fix this for inline - 2016-08-29
                            !inline ? 
                            <button className="TeXEditor-removeButton" onClick={this._remove}>
                                Remove
                            </button>
                            : null
                        }
                    </div>
                </div>;
        }

        return (
            <span className={className} contentEditable={false} data-entityData={JSON.stringify(this.getData())}>
                <KatexOutput 
                    content={texContent} 
                    onClick={this._onClick} 
                    inline={inline}
                />
                {editPanel}
            </span>
        );
    }
}
