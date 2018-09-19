// @flow
import * as React from 'react';
import { hydrateClassNames, type CommonGenericProps, type Id } from '../../common';
import ToggleButton from '../ToggleButton/ToggleButton';

export type Item =
  | string
  | {
      label: string,
      id?: Id,
      data?: any
    };

type Props = CommonGenericProps & {
  items: Array<Item>,
  selectedItem?: Item,
  selectedItemId?: Id,
  reverseOrder?: boolean,
  itemClassName?: string,
  collapsedToggleContent?: React.Node,
  expandedToggleContent?: React.Node,
  label?: string,
  onSelect?: Item => void
};

type SelectorState = {
  isExpanded: boolean
};

type SelectorItemProps = CommonGenericProps & {
  item: Item,
  index: number,
  isSelected: boolean,
  canReceiveFocus: boolean,
  onSelect?: Item => void,
  onRef: (?HTMLElement, number) => void
};

const defaultSelectorClassName = 'selector';
const expandToggleClassName = 'selector-toggle';
const selectorItemsClassName = 'selector-items';
const expandedClassName = 'expanded';
const collapsedClassName = 'collapsed';
const defaultItemClassName = 'selector-item';
const selectedClassName = 'selected';

const selectCollapsedClasses = classes => classes.selectorCollapsed || classes.selector;
const selectExpandedClasses = classes => classes.selectorExpanded || classes.selector;
const selectItemsContainerClasses = classes => classes.selectorItemsContainer;
const selectItemClasses = classes => classes.selectorItem;
const selectItemSelectedClasses = classes => classes.selectorItemSelected || classes.selectorItem;

const getLabel = (item: Item): string => {
  if (typeof item === 'string') {
    return item;
  } else {
    return item.label;
  }
};

const getId = (item: Item): string => {
  if (typeof item === 'string') {
    return item;
  } else {
    return (item.id == null ? item.label : item.id).toString();
  }
};

//TODO: Move into separate file.

class SelectorItem extends React.Component<SelectorItemProps> {
  handleRef = (element: ?HTMLElement) => {
    this.props.onRef(element, this.props.index);
  };

  handleClick = () => this.props.onSelect && this.props.onSelect(this.props.item);

  handleKeyUp = (keyboardEvent: KeyboardEvent) => {
    if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
      keyboardEvent.preventDefault();
      this.handleClick();
    }
  };

  render() {
    const { className, classNamePrefix, classes, item, isSelected, canReceiveFocus } = this.props;
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
        onKeyUp={this.handleKeyUp}
        tabIndex={tabIndex}>
        <div tabIndex={-1}>{label}</div>
      </div>
    );
  }
}

function isEqual(itemA: Item, itemB: ?Item, itemBId: ?Id): boolean {
  if (itemB != null) {
    return itemA === itemB;
  } else if (itemBId != null) {
    return typeof itemA !== 'string' && itemA.id === itemBId;
  } else {
    return false;
  }
}

//TODO: Move into separate file.

function focusElement(
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

class Selector extends React.Component<Props, SelectorState> {
  static defaultProps = {
    useDefaultClassNaming: true
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      isExpanded: false
    };
  }

  focusableItems: Array<?HTMLElement> = [];
  toggleElement: ?HTMLElement = null;

  onToggleRef = (toggleElement: ?HTMLElement) => {
    this.toggleElement = toggleElement;
  };

  handleToggle = (isOn: boolean) => this.setState({ isExpanded: isOn });

  handleItemRef = (itemElement: ?HTMLElement, index: number) => {
    this.focusableItems[index] = itemElement;
  };

  renderSelectorItem = (item: Item, index: number) => (
    <SelectorItem
      key={getId(item)}
      item={item}
      index={index}
      onSelect={this.props.onSelect}
      onRef={this.handleItemRef}
      isSelected={isEqual(item, this.props.selectedItem, this.props.selectedItemId)}
      canReceiveFocus={this.state.isExpanded}
      className={this.props.itemClassName}
      classes={this.props.classes}
      classNamePrefix={this.props.classNamePrefix}
    />
  );

  handleKeyDown = (keyboardEvent: KeyboardEvent) => {
    switch (keyboardEvent.key) {
      case 'ArrowUp':
      case 'Up':
        keyboardEvent.preventDefault();
        return;
      case 'ArrowDown':
      case 'Down':
        if (this.state.isExpanded) {
          keyboardEvent.preventDefault();
        }
        return;
      default:
        return;
    }
  };

  handleKeyUp = (keyboardEvent: KeyboardEvent) => {
    if (this.state.isExpanded) {
      if (keyboardEvent.key === 'ArrowUp' || keyboardEvent.key === 'Up') {
        keyboardEvent.preventDefault();
        focusElement(true, this.props.reverseOrder || false, this.focusableItems, this.toggleElement);
      }
      if (keyboardEvent.key === 'ArrowDown' || keyboardEvent.key === 'Down') {
        keyboardEvent.preventDefault();
        const focusedElement = focusElement(false, this.props.reverseOrder || false, this.focusableItems, this.toggleElement);
        if (focusedElement === this.toggleElement) {
          this.setState({ isExpanded: false });
        }
      }
    } else {
      if (keyboardEvent.key === 'ArrowUp' || keyboardEvent.key === 'Up') {
        keyboardEvent.preventDefault();
        this.setState({ isExpanded: true });
      }
    }
  };

  render() {
    const {
      className,
      classNamePrefix,
      classes,
      items,
      collapsedToggleContent,
      expandedToggleContent,
      reverseOrder,
      label
    } = this.props;
    const renderedItems = items
      ? reverseOrder
        ? items.map(this.renderSelectorItem).reverse()
        : items.map(this.renderSelectorItem)
      : null;
    const classNames = hydrateClassNames({
      classes,
      classNamePrefix,
      selectClasses: this.state.isExpanded ? selectExpandedClasses : selectCollapsedClasses,
      classNames: [className, defaultSelectorClassName, this.state.isExpanded ? expandedClassName : collapsedClassName]
    });
    const itemsContainerClassNames = hydrateClassNames({
      classes,
      selectClasses: selectItemsContainerClasses,
      classNamePrefix,
      classNames: [selectorItemsClassName]
    });
    const toggleButtonClasses = classes
      ? {
          toggleButtonOff: classes.selectorToggle || classes.selectorToggleOff,
          toggleButtonOn: classes.selectorToggleOn
        }
      : null;

    return (
      <div className={classNames} onKeyUp={this.handleKeyUp} onKeyDown={this.handleKeyDown}>
        <ToggleButton
          isOn={this.state.isExpanded}
          className={expandToggleClassName}
          classNamePrefix={classNamePrefix}
          classes={toggleButtonClasses}
          label={label}
          onToggle={this.handleToggle}
          onRef={this.onToggleRef}
          toggledOffContent={collapsedToggleContent}
          toggledOnContent={expandedToggleContent}
        />
        <div role="listbox" className={itemsContainerClassNames}>
          {renderedItems}
        </div>
      </div>
    );
  }
}

export default Selector;
