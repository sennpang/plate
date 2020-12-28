import { getOnHotkeyToggleMarkDefault } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { DEFAULTS_KBD } from './defaults';
import { deserializeKbd } from './deserializeKbd';
import { renderLeafKbd } from './renderLeafKbd';
import { KbdPluginOptions } from './types';

/**
 * Enables support for code formatting
 */
export const KbdPlugin = (options?: KbdPluginOptions): SlatePlugin => ({
  renderLeaf: renderLeafKbd(options),
  deserialize: deserializeKbd(options),
  onKeyDown: getOnHotkeyToggleMarkDefault({
    key: 'kbd',
    defaultOptions: DEFAULTS_KBD,
    options,
  }),
});
