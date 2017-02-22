/*
 * Copyright (c) 2016, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import AlignLeftIcon from 'material-ui/svg-icons/editor/format-align-left';
import AlignCenterIcon from 'material-ui/svg-icons/editor/format-align-center';
import AlignRightIcon from 'material-ui/svg-icons/editor/format-align-right';


export const DEFAULT_DISPLAY_OPTIONS = [
  {"key": "small", "icon": AlignLeftIcon, "label": "SMALL"},
  {"key": "medium", "icon": AlignCenterIcon, "label": "MEDIUM"},
  {"key": "big", "icon": AlignRightIcon, "label": "BIG"}
];
export const DEFAULT_DISPLAY_KEY = "medium";

export const DEFAULT_ALIGN_OPTIONS = [
  {"key": "left", "icon": AlignLeftIcon, "label": "LEFT"},
  {"key": "center", "icon": AlignCenterIcon, "label": "CENTER"},
  {"key": "right", "icon": AlignRightIcon, "label": "RIGHT"}
];
export const DEFAULT_ALIGN_KEY = "center";
