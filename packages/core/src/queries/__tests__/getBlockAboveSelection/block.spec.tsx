/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Value } from '../../../slate/editor/TEditor';
import { PlateEditor } from '../../../types/plate/PlateEditor';
import { getBlockAbove } from '../../index';

jsx;

const input = ((
  <editor>
    <hh1>
      <hp>
        test
        <cursor />
      </hp>
    </hh1>
  </editor>
) as any) as PlateEditor;

const output = <hp>test</hp>;

it('should be', () => {
  expect(getBlockAbove(input)).toEqual([output, [0, 0]]);
});
