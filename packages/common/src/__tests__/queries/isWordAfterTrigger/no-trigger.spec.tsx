/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor, Range } from 'slate';
import { isWordAfterTrigger } from '../../../queries/index';

const input = ((
  <editor>
    <hp>
      test
      <cursor /> test2
    </hp>
  </editor>
) as any) as Editor;

const at = Range.start(input.selection as Range);

const output = {
  match: false,
  range: undefined,
};

it('should be', () => {
  expect(isWordAfterTrigger(input, { at, trigger: '@' })).toEqual(output);
});
