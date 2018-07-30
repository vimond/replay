import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import RenderIfEnabled from './RenderIfEnabled';

Enzyme.configure({ adapter: new Adapter() });

class MyButton extends React.Component {
  render() {
    return <button>My button</button>;
  }
}

class MyText extends React.Component {
  render() {
    return <p>My text</p>;
  }
}

function MySeparator() {
  return <hr />;
}

class ConnectedMyHeader extends React.Component {
  render() {
    return <h1>My header</h1>;
  }
}

const configuration = ['myButton', 'myHeader', 'mySeparator'];

test('<RenderIfEnabled /> only renders elements with names in the configuration when specified.', () => {
  const rendered = mount(
    <RenderIfEnabled configuration={configuration}>
      <MyButton />
      <MyText />
      <MySeparator />
      <ConnectedMyHeader />
    </RenderIfEnabled>
  );
  const myButton = rendered.find(MyButton);
  const myText = rendered.find(MyText);
  const mySeparator = rendered.find(MySeparator);
  const myHeader = rendered.find(ConnectedMyHeader);

  expect(myButton).toHaveLength(1);
  test('<RenderIfEnabled /> ignores the "Connected" part of a control name when matching with configuration.', () => {
    expect(myText).toHaveLength(0);
  });
  expect(mySeparator).toHaveLength(1);
  expect(myHeader).toHaveLength(1);
});

test('<RenderIfEnabled /> renders all elements when there is no configuration.', () => {
  const rendered = mount(
    <RenderIfEnabled configuration={null}>
      <MyButton />
      <MyText />
      <MySeparator />
      <ConnectedMyHeader />
    </RenderIfEnabled>
  );
  const myButton = rendered.find(MyButton);
  const myText = rendered.find(MyText);
  const mySeparator = rendered.find(MySeparator);
  const myHeader = rendered.find(ConnectedMyHeader);

  expect(myButton).toHaveLength(1);
  expect(myText).toHaveLength(1);
  expect(mySeparator).toHaveLength(1);
  expect(myHeader).toHaveLength(1);
});
