// @flow
import * as React from 'react';
import { getKeyboardShortcutBlocker, hydrateClassNames } from '../../common';
import type { Item } from './Selector';
import type { CommonGenericProps } from '../../common';

type SelectorItemProps = CommonGenericProps & {
  item: Item,
  index: number,
  isSelected: boolean,
  canReceiveFocus: boolean,
  defaultItemClassName: string,
  selectedClassName: string,
  onSelect?: Item => void,
  onRef: (?HTMLElement, number) => void
};

const selectItemClasses = classes => classes.selectorItem;
const selectItemSelectedClasses = classes => classes.selectorItemSelected || classes.selectorItem;

const getLabel = (item: Item): string => {
  if (typeof item === 'string') {
    return item;
  } else {
    return item.label;
  }
};

export class SelectorItem extends React.Component<SelectorItemProps> {
  handleRef = (element: ?HTMLElement) => {
    this.props.onRef(element, this.props.index);
  };

  handleClick = () => this.props.onSelect && this.props.onSelect(this.props.item);

  handleKeyDown = getKeyboardShortcutBlocker(['Enter', ' ']);

  handleKeyUp = (keyboardEvent: KeyboardEvent) => {
    if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
      keyboardEvent.preventDefault();
      this.handleClick();
    }
  };

  render() {
    const { className, classNamePrefix, classes, defaultItemClassName, item, isSelected, canReceiveFocus, selectedClassName } = this.props;
    const label = getLabel(item);
    const classNames = hydrateClassNames({
      classes,
      classNamePrefix,
      selectClasses: isSelected ? selectItemSelectedClasses : selectItemClasses,
      classNames: [className, defaultItemClassName, isSelected ? selectedClassName : null]
    });
    const tabIndex = canReceiveFocus ? 0 : undefined;
    return (
      <div
        role="option"
        aria-selected={isSelected}
        className={classNames}
        ref={this.handleRef}
        onClick={this.handleClick}
        onKeyDown={this.handleKeyDown}
        onKeyUp={this.handleKeyUp}
        tabIndex={tabIndex}>
        <div tabIndex={-1}>{label}</div>
      </div>
    );
  }
}

export function focusElement(
  upwards: boolean,
  isReverseOrder: boolean,
  items: Array<?HTMLElement>,
  baseElement: ?HTMLElement
) {
  const elements = (isReverseOrder ? items.slice(0).reverse() : items).concat(baseElement);
  for (let i = 0; i < elements.length; i++) {
    if (elements[i] === document.activeElement) {
      if (upwards) {
        if (i > 0) {
          for (let j = i - 1; j >= 0; j--) {
            const element = elements[j];
            if (element) {
              element.focus();
              return element;
            }
          }
        }
      } else {
        if (i < elements.length - 1) {
          for (let j = i + 1; j < elements.length; j++) {
            const element = elements[j];
            if (element) {
              element.focus();
              return element;
            }
          }
        }
      }
    }
  }
}