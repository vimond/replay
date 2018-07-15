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
  isSelected: boolean,
  onSelect?: Item => void
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

class SelectorItem extends React.Component<SelectorItemProps> {
  handleClick = () => this.props.onSelect && this.props.onSelect(this.props.item);

  render() {
    const { className, classNamePrefix, classes, item, isSelected } = this.props;
    const label = getLabel(item);
    const classNames = hydrateClassNames({
      classes,
      classNamePrefix,
      selectClasses: isSelected ? selectItemSelectedClasses : selectItemClasses,
      classNames: [
        className,
        defaultItemClassName,
        isSelected ? selectedClassName : null
      ]
    });
    return (
      <div onClick={this.handleClick} className={classNames}>
        {label}
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

  handleToggle = (isOn: boolean) => this.setState({ isExpanded: isOn });

  renderSelectorItem = (item: Item) => (
    <SelectorItem
      key={getId(item)}
      item={item}
      onSelect={this.props.onSelect}
      isSelected={isEqual(item, this.props.selectedItem, this.props.selectedItemId)}
      className={this.props.itemClassName}
      classes={this.props.classes}
      classNamePrefix={this.props.classNamePrefix}
    />
  );

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
      classNames: [
        className,
        defaultSelectorClassName,
        this.state.isExpanded ? expandedClassName : collapsedClassName
      ]
    });
    const itemsContainerClassNames = hydrateClassNames({
      classes,
      selectClasses: selectItemsContainerClasses,
      classNamePrefix,
      classNames: [selectorItemsClassName]
    });
    const toggleButtonClasses = classes ? {
      toggleButtonOff: classes.selectorToggle || classes.selectorToggleOff,
      toggleButtonOn: classes.selectorToggleOn
    } : null;

    return (
      <div className={classNames}>
        <ToggleButton
          isOn={this.state.isExpanded}
          className={expandToggleClassName}
          classNamePrefix={classNamePrefix}
          classes={toggleButtonClasses}
          label={label}
          onToggle={this.handleToggle}
          toggledOffContent={collapsedToggleContent}
          toggledOnContent={expandedToggleContent}
        />
        <div className={itemsContainerClassNames}>
          {renderedItems}
        </div>
      </div>
    );
  }
}

export default Selector;
