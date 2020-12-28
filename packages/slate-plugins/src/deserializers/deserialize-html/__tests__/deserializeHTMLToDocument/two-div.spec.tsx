/** @jsx jsx */

import { SlatePlugin } from '@udecode/slate-plugins-core';
import { getHtmlDocument, jsx } from '@udecode/slate-plugins-test-utils';
import { deserializeHTMLToDocument } from '../../index';

const html = '<div>first</div><div>second</div>';
const input1: SlatePlugin[] = [];
const input2 = getHtmlDocument(html).body;

const output = (
  <fragment>
    <block>
      <htext>first</htext>
      <htext>second</htext>
    </block>
  </fragment>
) as any;

it('should have the break line', () => {
  expect(
    deserializeHTMLToDocument({
      plugins: input1,
      element: input2,
    })
  ).toEqual(output);
});
