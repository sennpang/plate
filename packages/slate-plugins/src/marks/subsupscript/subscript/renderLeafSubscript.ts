import { getRenderLeafDefault } from '@udecode/slate-plugins-common';
import { DEFAULTS_SUBSUPSCRIPT } from '../defaults';
import { SubscriptRenderLeafOptions } from './types';

export const renderLeafSubscript = (options?: SubscriptRenderLeafOptions) =>
  getRenderLeafDefault({
    key: 'subscript',
    defaultOptions: DEFAULTS_SUBSUPSCRIPT,
    options,
  });
