// @flow 
import * as React from 'react';
import { type CommonProps, type Id, prefixClassNames } from './common';
import ToggleButton from './ToggleButton';

type Item = {
    label: string,
    id?: Id
};

type Props = CommonProps & {
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

type SelectorItemProps = CommonProps & {
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

class DropUpSelectorItem extends React.Component<SelectorItemProps> {
    constructor(props) {
        super(props);
    }
    
    handleClick = () => this.props.onSelect && this.props.onSelect(this.props.item);
    
    render() {
        const {
            className,
            classNamePrefix,
            item,
            isSelected
        } = this.props;
        if (isSelected) {
            const selectedClassNames = prefixClassNames(classNamePrefix, className, defaultItemClassName, selectedClassName);
            return <div key={(item.id || item.label).toString()} onClick={this.handleClick} className={selectedClassNames}>{item.label}</div>;
        } else {
            const classNames = prefixClassNames(classNamePrefix, className, defaultItemClassName);
            return <div key={(item.id || item.label).toString()} onClick={this.handleClick} className={classNames}>{item.label}</div>;
        }
    }
}

function isEqual(itemA:Item, itemB:?Item, itemBId:?Id):boolean {
    if (itemB != null) {
        return itemA === itemB;
    } else if (itemBId != null) {
        return itemA.id === itemBId;
    } else {
        return false;
    }
}

class DropUpSelector extends React.Component<Props, DropUpState> {
    // TODO: Can we inherit this from base component?
    static defaultProps = {
        classNamePrefix: 'player-'
    }

    constructor(props: Props) {
        super(props);
        this.state = {
            isExpanded: false
        };
    }
    
    handleToggle = (isOn:boolean) => this.setState({ isExpanded: isOn });
    
    renderSelectorItem = (item:Item) => <DropUpSelectorItem key={(item.id || item.label).toString()} item={item} onSelect={this.props.onSelect} isSelected={isEqual(item, this.props.selectedItem, this.props.selectedItemId)} className={this.props.itemClassName} classNamePrefix={this.props.classNamePrefix}  /> 

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
        const renderedItems = reverseOrder ? items.map(this.renderSelectorItem).reverse() : items.map(this.renderSelectorItem);
        const classNames = prefixClassNames(classNamePrefix, className, defaultSelectorClassName, this.state.isExpanded ? expandedClassName : collapsedClassName);
        return (
            <div className={classNames}>
                <ToggleButton className={expandToggleClassName} classNamePrefix={classNamePrefix} label={label} onToggle={this.handleToggle} toggledOffContent={collapsedToggleContent} toggledOnContent={expandedToggleContent} />
                <div className={prefixClassNames(classNamePrefix, selectorItemsClassName)}>{renderedItems}</div>
            </div>
        );
    }
}

export default DropUpSelector;