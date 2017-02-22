import { shouldRenderToolbar, getToolbarPosition, getToolbarComponents } from './utils/textToolbar';
import Decorator from './decorators/toolbar';
import styles from './styles.css';
import airToolbarHandler from './air-toolbar';

const toolbarPlugin = (config = {}) => {
  const theme = config.theme || styles;
  const toolbarHandler = config.toolbarHandler || { ...airToolbarHandler, ...config };

  return {
    // Re-Render the text-toolbar onChange (on selection change)
    onChange: (editorState, { setEditorState }) => {
      if (typeof window !== 'undefined') {
        const props = {
          uid: 'text-toolbar',
          components: getToolbarComponents(config, editorState, setEditorState),
          editorState,
          getTargetRectangle: getToolbarPosition,
          setEditorState,
          theme
        };
        if (toolbarHandler.textMode !== 'select' || shouldRenderToolbar(editorState)) {
          toolbarHandler.add(props);
        } else {
          toolbarHandler.remove(props);
        }
      }
      return editorState;
    },
    // Wrap all block-types in hover-toolbar decorator
    blockRendererFn: (contentBlock, { }) => ({
      props: {
        toolbarHandler
      }
    }),
  };
};

import React from 'react'

export default toolbarPlugin;

export const ToolbarDecorator = (options = {}) => Decorator({ theme: options.theme || styles });

const stylez = {
    separator: {
        'borderLeft': '5px solid rgba(192,192,192,0.3)',
        height: '70px',
    }
}

export const Separator = (props) => (
    <div style={stylez.separator}>
    </div>
)
