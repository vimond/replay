// @flow
import * as React from 'react';
import { type CommonGenericProps, hydrateClassNames } from '../../common';

type Props = CommonGenericProps & {
  /** Set to true if the button should be in the toggled on mode. */
  isOn?: boolean,
  /** The label will appear in the title attribute of the root DOM element of the toggle button. */
  label?: string,
  /** The button content to be displayed when the button is toggled off. */
  toggledOffContent?: React.Node,
  /** The button content to be displayed when the button is toggled on. */
  toggledOnContent?: React.Node,
  /** A callback method that will be invoked when the button is clicked and the value toggled. If the button has been toggled on, true is passed to the callback. */
  onToggle?: boolean => void
};

const baseClassName = 'toggle-button';
const offClassName = 'toggled-off';
const onClassName = 'toggled-on';

const selectOffClasses = classes => classes.toggleButtonOff || classes.toggleButton;
const selectOnClasses = classes => classes.toggleButtonOn || classes.toggleButton;

/**
 * Renders a button with two states - toggled on and off. When clicked, it reports back the opposite state.
 */
class ToggleButton extends React.Component<Props> {
  static defaultProps = {
    useDefaultClassNaming: true
  };

  handleClick = () => this.props.onToggle && this.props.onToggle(!this.props.isOn);

  render() {
    const {
      isOn,
      label,
      className,
      classNamePrefix,
      toggledOnContent,
      toggledOffContent,
      classes
    } = this.props;
    const toggleClassName = isOn ? onClassName : offClassName;
    const classNames = hydrateClassNames({
      classes,
      selectClasses: isOn ? selectOnClasses : selectOffClasses,
      classNamePrefix,
      classNames: [className, baseClassName, toggleClassName]
    });
    const content = isOn ? toggledOnContent : toggledOffContent;
    return (
      <div title={label} onClick={this.handleClick} className={classNames}>
        {content}
      </div>
    );
  }
}

export default ToggleButton;
