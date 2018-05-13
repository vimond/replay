// @flow 
import * as React from 'react';
import { type CommonGenericProps, type Id, prefixClassNames } from '../common';
import ToggleButton from './ToggleButton';

export type Item = string | {
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
    label?:string,
    onSelect?: Item => void
};

type DropUpState = {
    isExpanded: boolean
};

type SelectorItemProps = CommonGenericProps & {
    item: Item,
    isSelected: boolean,
    onSelect?: Item => void
};

const defaultSelectorClassName = 'drop-up-selector';
const expandToggleClassName = 'drop-up-selector-toggle';
const selectorItemsClassName = 'drop-up-selector-items';
const expandedClassName = 'expanded';
const collapsedClassName = 'collapsed';
const defaultItemClassName = 'drop-up-selector-item';
const selectedClassName = 'selected';

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


class DropUpSelectorItem extends React.Component<SelectorItemProps> {
    handleClick = () => this.props.onSelect && this.props.onSelect(this.props.item);
    
    render() {
        const {
            className,
            classNamePrefix,
            item,
            isSelected
        } = this.props;
        const label = getLabel(item);
        if (isSelected) {
            const selectedClassNames = prefixClassNames(classNamePrefix, className, defaultItemClassName, selectedClassName);
            return <div onClick={this.handleClick} className={selectedClassNames}>{label}</div>;
        } else {
            const classNames = prefixClassNames(classNamePrefix, className, defaultItemClassName);
            return <div onClick={this.handleClick} className={classNames}>{label}</div>;
        }
    }
}

function isEqual(itemA:Item, itemB:?Item, itemBId:?Id):boolean {
    if (itemB != null) {
        return itemA === itemB;
    } else if (itemBId != null) {
        return typeof itemA !== 'string' && itemA.id === itemBId;
    } else {
        return false;
    }
}

class DropUpSelector extends React.Component<Props, DropUpState> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isExpanded: false
        };
    }
    
    handleToggle = (isOn:boolean) => this.setState({ isExpanded: isOn });
    
    renderSelectorItem = (item:Item) => <DropUpSelectorItem key={getId(item)} item={item} onSelect={this.props.onSelect} isSelected={isEqual(item, this.props.selectedItem, this.props.selectedItemId)} className={this.props.itemClassName} classNamePrefix={this.props.classNamePrefix}  /> 

    render() {
        const {
            className,
            classNamePrefix,
            items,
            collapsedToggleContent,
            expandedToggleContent,
            reverseOrder,
            label
        } = this.props;
        const renderedItems = items ? (reverseOrder ? items.map(this.renderSelectorItem).reverse() : items.map(this.renderSelectorItem)) : null;
        const classNames = prefixClassNames(classNamePrefix, className, defaultSelectorClassName, this.state.isExpanded ? expandedClassName : collapsedClassName);
        return (
            <div className={classNames}>
                <ToggleButton isOn={this.state.isExpanded} className={expandToggleClassName} classNamePrefix={classNamePrefix} label={label} onToggle={this.handleToggle} toggledOffContent={collapsedToggleContent} toggledOnContent={expandedToggleContent} />
                <div className={prefixClassNames(classNamePrefix, selectorItemsClassName)}>{renderedItems}</div>
            </div>
        );
    }
}

export default DropUpSelector;