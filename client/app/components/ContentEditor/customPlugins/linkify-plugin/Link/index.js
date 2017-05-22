import React, { Component } from 'react';
import linkifyIt from 'linkify-it';
import tlds from 'tlds';
import classNames from 'classnames'

const linkify = linkifyIt();
linkify.tlds(tlds);

// The component we render when we encounter a hyperlink in the text
export default class Link extends Component {
    render() {
        /* eslint-disable no-use-before-define */
        const {
            decoratedText = '',
            theme = {},
            target = '_self',
            className,
            ...props,
        } = this.props;
        /* eslint-enable */
        const combinedClassName = classNames(theme.link, className);
        const links = linkify.match(decoratedText);
        const href = links && links[0] ? links[0].url : '';
        return (
            <a
                { ...props }
                href={ href }
                className={ combinedClassName }
                target={ target }
            />
        );
    }
}
