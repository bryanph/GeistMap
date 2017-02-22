import React, { Component } from 'react';
import Editor from 'draft-js-plugins-editor-wysiwyg';
import createCleanupEmptyPlugin from 'draft-js-cleanup-empty-plugin';
import createEntityPropsPlugin from 'draft-js-entity-props-plugin';
import createFocusPlugin, { FocusDecorator } from 'draft-js-focus-plugin';
import createDndPlugin, { DraggableDecorator } from 'draft-js-dnd-plugin';
import createToolbarPlugin, { ToolbarDecorator } from 'draft-js-toolbar-plugin';
import createAlignmentPlugin, { AlignmentDecorator } from 'draft-js-alignment-plugin';
import createResizeablePlugin, { ResizeableDecorator } from 'draft-js-resizeable-plugin';
// import createLinkifyPlugin from 'draft-js-linkify-plugin';

// Blocks
import createImagePlugin, { imageCreator, imageStyles } from 'draft-js-image-plugin';
import createTablePlugin, { tableCreator, tableStyles } from 'draft-js-table-plugin';

// Styles
import 'draft-js-alignment-plugin/lib/plugin.css';
import 'draft-js-focus-plugin/lib/plugin.css';
import 'draft-js-image-plugin/lib/plugin.css';
import 'draft-js-table-plugin/lib/plugin.css';
import 'draft-js-toolbar-plugin/lib/plugin.css';
// import 'draft-js-linkify-plugin/lib/plugin.css';

// Utils
import addBlock from 'draft-js-dnd-plugin/lib/modifiers/addBlock';
import { RichUtils, Entity } from 'draft-js';

const image = ResizeableDecorator({
  resizeSteps: 10,
  handles: true,
  vertical: 'auto'
})(
  DraggableDecorator(
    FocusDecorator(
      AlignmentDecorator(
        ToolbarDecorator()(
          imageCreator({ theme: imageStyles })
        )
      )
    )
  )
);
const table = FocusDecorator(
  DraggableDecorator(
    ToolbarDecorator()(
      tableCreator({ theme: tableStyles, Editor })
    )
  )
);

// Init Plugins
export default ({ 
    handleUpload, 
    handleDefaultData,
    plugins = [],
    toolbar = { disableItems: [], textActions: []}
}) => [
  ...plugins,
  createCleanupEmptyPlugin({
    types: ['block-image', 'block-table']
  }),
  createEntityPropsPlugin({ }),
  // createLinkifyPlugin(),
  createFocusPlugin({}),
  createAlignmentPlugin({}),
  createDndPlugin({
    allowDrop: true,
    handleUpload,
    handleDefaultData,
    handlePlaceholder: (state, selection, data) => {
      const { type } = data;
      if (type.indexOf('image/') === 0) {
        return 'block-image';
      } else if (type.indexOf('text/') === 0 || type === 'application/json') {
        return 'placeholder-github';
      } return undefined;
    }, handleBlock: (state, selection, data) => {
      const { type } = data;
      if (type.indexOf('image/') === 0) {
        return 'block-image';
      } else if (type.indexOf('text/') === 0 || type === 'application/json') {
        return 'block-text';
      } return undefined;
    },
  }),
  createResizeablePlugin({}),
  // Blocks
  createImagePlugin({ component: image }),
  createTablePlugin({ component: table, Editor }),
];
