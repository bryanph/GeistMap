import React, { Component } from 'react';
import {
    Editor,
    EditorState,
} from 'draft-js';

import createCompositeDecorator from './createCompositeDecorator';
import moveSelectionToEnd from './moveSelectionToEnd';
import proxies from './proxies';
import * as defaultKeyBindingPlugin from './defaultKeyBindingPlugin';
import { List } from 'immutable';

/**
 * The main editor component
 */
class PluginEditor extends Component {

    props: {
        editorState: {},
        onChange: func,
        plugins: [],
        defaultKeyBindings: boolean,
        customStyleMap: {},
        decorators: [],
    };

    static defaultProps = {
        defaultKeyBindings: true,
        customStyleMap: {},
        plugins: [],
        decorators: [],
    };

    constructor(props) {
        super(props);

        this.resolvedPlugins = this.props.plugins.map(plugin => {
            if (typeof plugin !== 'function') {
                return plugin
            }
            return plugin(this.getPluginMethods())
        })

        const plugins = [this.props, ...this.resolvePlugins()];
        for (const plugin of plugins) {
            if (typeof plugin.initialize !== 'function') continue;
            plugin.initialize(this.getPluginMethods());
        }


        this.state = {}; // TODO for Nik: ask ben why this is relevent
    }

    componentWillMount() {
        const compositeDecorator = createCompositeDecorator(
            this.resolveDecorators(),
            this.getEditorState,
            this.onChange);
        const _editorState = EditorState.set(this.props.editorState, { decorator: compositeDecorator });
        this.onChange(moveSelectionToEnd(_editorState));
    }

    componentWillUnmount() {
        this.resolvePlugins().forEach((plugin) => {
            if (plugin.willUnmount) {
                plugin.willUnmount({
                    getEditorState: this.getEditorState,
                    setEditorState: this.onChange,
                });
            }
        });
    }

    // Cycle through the plugins, changing the editor state with what the plugins
    // changed (or didn't)
    onChange = (editorState, forceUpdate=false) => {
        let newEditorState = editorState;
        this.resolvePlugins().forEach((plugin) => {
            if (plugin.onChange) {
                newEditorState = plugin.onChange(newEditorState, this.getPluginMethods(), forceUpdate);
            }
        });

        if (this.props.onChange) {
            this.props.onChange(newEditorState, this.getPluginMethods(), forceUpdate);
        }
    };

    getPlugins = () => this.resolvedPlugins.slice(0);
    getProps = () => ({ ...this.props });

    // TODO further down in render we use readOnly={this.props.readOnly || this.state.readOnly}. Ask Ben why readOnly is here just from the props? Why would plugins use this instead of just taking it from getProps?
    getReadOnly = () => this.props.readOnly;
    setReadOnly = (readOnly) => {
        if (readOnly !== this.state.readOnly) this.setState({ readOnly });
    };

    getEditorState = () => this.props.editorState;
    getPluginMethods = () => ({
        getPlugins: this.getPlugins,
        getProps: this.getProps,
        setEditorState: this.onChange,
        getEditorState: this.getEditorState,
        getReadOnly: this.getReadOnly,
        setReadOnly: this.setReadOnly,
        getBlockRenderMap: () => this.props.blockRenderMap,
        focus: () => this.editor.focus(),
        getClipboard: () => this.editor.getClipboard(),
        setClipboard: () => this.editor.setClipboard(),
        getEditorKey: () => this.editor.getEditorKey(),
    });

    createEventHooks = (methodName, plugins) => (...args) => {
        const newArgs = [].slice.apply(args);
        newArgs.push(this.getPluginMethods());

        if (methodName === 'handleKeyCommand') {
            for (const plugin of plugins) {
                if (typeof plugin[methodName] !== 'function') continue;
                const result = plugin[methodName](...newArgs);
                if (result === 'handled') return 'handled';
            }
            // TODO: why not not-handled? - 2016-08-29
            return false
        }

        for (const plugin of plugins) {
            if (typeof plugin[methodName] !== 'function') continue;
            const result = plugin[methodName](...newArgs);
            if (result === true) return true;
        }

        return false;
    };

    createFnHooks = (methodName, plugins) => (...args) => {
        const newArgs = [].slice.apply(args);

        newArgs.push(this.getPluginMethods());

        if (methodName === 'blockRendererFn') {
            let block = { props: {} };
            for (const plugin of plugins) {
                if (typeof plugin[methodName] !== 'function') continue;
                const result = plugin[methodName](...newArgs);
                if (result !== undefined && result !== null) {
                    const { props: pluginProps, ...pluginRest } = result; // eslint-disable-line no-use-before-define
                    const { props, ...rest } = block; // eslint-disable-line no-use-before-define
                    block = { ...rest, ...pluginRest, props: { ...props, ...pluginProps } };
                }
            }

            return block.component ? block : false;
        } else if (methodName === 'blockStyleFn') {
            let styles;
            for (const plugin of plugins) {
                if (typeof plugin[methodName] !== 'function') continue;
                const result = plugin[methodName](...newArgs);
                if (result !== undefined) {
                    styles = (styles ? (`${styles} `) : '') + result;
                }
            }
            return styles || '';
        }

        for (const plugin of plugins) {
            if (typeof plugin[methodName] !== 'function') continue;
            const result = plugin[methodName](...newArgs);
            if (Boolean(result)) {
                return result;
            }
        }

        return false;
    };

    createPluginHooks = () => {
        const pluginHooks = {};
        const eventHookKeys = [];
        const fnHookKeys = [];
        const plugins = [this.props, ...this.resolvePlugins()];

        plugins.forEach((plugin) => {
            Object.keys(plugin).forEach((attrName) => {
                if (attrName === 'onChange') return;

                // if `attrName` has been added as a hook key already, ignore this one
                if (eventHookKeys.indexOf(attrName) !== -1 || fnHookKeys.indexOf(attrName) !== -1) return;

                const isEventHookKey = attrName.indexOf('on') === 0 || attrName.indexOf('handle') === 0;
                if (isEventHookKey) {
                    eventHookKeys.push(attrName);
                    return;
                }

                // checks if `attrName` ends with 'Fn'
                const isFnHookKey = (attrName.length - 2 === attrName.indexOf('Fn'));
                if (isFnHookKey) {
                    fnHookKeys.push(attrName);
                }
            });
        });

        eventHookKeys.forEach((attrName) => {
            pluginHooks[attrName] = this.createEventHooks(attrName, plugins);
        });

        fnHookKeys.forEach((attrName) => {
            pluginHooks[attrName] = this.createFnHooks(attrName, plugins);
        });

        return pluginHooks;
    };

    resolvePlugins = () => {
        const plugins = this.resolvedPlugins.slice(0);
        if (this.props.defaultKeyBindings) {
            plugins.push(defaultKeyBindingPlugin);
        }

        return plugins;
        // return this.resolvedPlugins
    };

    resolveDecorators = () => {
        const { decorators } = this.props;
        return List([{ decorators }, ...this.resolvedPlugins])
            .filter((plugin) => plugin.decorators !== undefined)
            .flatMap((plugin) => plugin.decorators);
    };

    resolveCustomStyleMap = () => (
        this.resolvedPlugins
        .filter(plug => plug.customStyleMap !== undefined)
        .map(plug => plug.customStyleMap)
        .concat([this.props.customStyleMap])
        .reduce((styles, style) => (
            {
                ...styles,
                ...style,
            }
        ), {})
    );

    resolveAccessibilityProps = () => {
        let accessibilityProps = {};
        const plugins = [this.props, ...this.resolvePlugins()];
        for (const plugin of plugins) {
            if (typeof plugin.getAccessibilityProps !== 'function') continue;
            const props = plugin.getAccessibilityProps();
            const popupProps = {};

            if (accessibilityProps.ariaHasPopup === undefined) {
                popupProps.ariaHasPopup = props.ariaHasPopup;
            } else if (props.ariaHasPopup === 'true') {
                popupProps.ariaHasPopup = 'true';
            }

            if (accessibilityProps.ariaExpanded === undefined) {
                popupProps.ariaExpanded = props.ariaExpanded;
            } else if (props.ariaExpanded === 'true') {
                popupProps.ariaExpanded = 'true';
            }

            accessibilityProps = {
                ...accessibilityProps,
                ...props,
                ...popupProps,
            };
        }

        return accessibilityProps;
    };

    render() {
        const pluginHooks = this.createPluginHooks();
        const customStyleMap = this.resolveCustomStyleMap();
        const accessibilityProps = this.resolveAccessibilityProps();

        return (
            <Editor
                { ...this.props }
                { ...accessibilityProps }
                { ...pluginHooks }
                readOnly={this.props.readOnly || this.state.readOnly}
                customStyleMap={ customStyleMap }
                onChange={ this.onChange }
                editorState={ this.props.editorState }
                ref={(element) => { this.editor = element; }}
            />
        );
    }
}

export default PluginEditor;
