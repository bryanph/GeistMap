/**
 * Creates a composite decorator based on the provided plugins
 */

import { List } from 'immutable';
import { CompositeDecorator } from 'draft-js';
import withProps from 'recompose/withProps'

export default (decorators, getEditorState, setEditorState) => {

    const convertedDecorators = List(decorators)
        .map((decorator) => ({
            ...decorator,
            component: withProps({ getEditorState, setEditorState })(decorator.component),
        }))
        .toJS();

    return new CompositeDecorator(convertedDecorators);
};
