import { useEffect } from 'react';
import {
  getPluginOptions,
  HTMLPropsAs,
  useComposedRef,
  useEditorRef,
  useHotkeys,
  useOnClickOutside,
} from '@udecode/plate-core';
import { getSelectionBoundingClientRect } from '@udecode/plate-floating';
import { useFocused } from 'slate-react';
import { ELEMENT_LINK, LinkPlugin } from '../../createLinkPlugin';
import { triggerFloatingLinkInsert } from '../../utils/triggerFloatingLinkInsert';
import { FloatingLinkProps } from './FloatingLink';
import {
  floatingLinkActions,
  floatingLinkSelectors,
  useFloatingLinkSelectors,
} from './floatingLinkStore';
import { useFloatingLinkEscape } from './useFloatingLinkEscape';
import { useVirtualFloatingLink } from './useVirtualFloatingLink';

export const useFloatingLinkInsert = ({
  floatingOptions,
  ...props
}: FloatingLinkProps): HTMLPropsAs<'div'> => {
  const editor = useEditorRef();
  const focused = useFocused();
  const mode = useFloatingLinkSelectors().mode();
  const open = useFloatingLinkSelectors().open();

  const { triggerFloatingLinkHotkeys } = getPluginOptions<LinkPlugin>(
    editor,
    ELEMENT_LINK
  );

  useHotkeys(
    triggerFloatingLinkHotkeys!,
    () => {
      triggerFloatingLinkInsert(editor, {
        focused,
      });
    },
    {
      enableOnContentEditable: true,
    },
    [focused]
  );

  const ref = useOnClickOutside(() => {
    if (floatingLinkSelectors.mode() === 'insert') {
      floatingLinkActions.hide();
    }
  });

  const { update, style, floating } = useVirtualFloatingLink({
    open: open && mode === 'insert',
    getBoundingClientRect: getSelectionBoundingClientRect,
    whileElementsMounted: () => {},
    ...floatingOptions,
  });

  // wait for update before focusing input
  useEffect(() => {
    if (open) {
      update();
      floatingLinkActions.updated(true);
    } else {
      floatingLinkActions.updated(false);
    }
  }, [open, update]);

  useFloatingLinkEscape();

  return {
    style: {
      ...style,
      zIndex: 1,
    },
    ...props,
    ref: useComposedRef<HTMLElement | null>(props.ref, floating, ref),
  };
};
