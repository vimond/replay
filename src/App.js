import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import DropUpSelector from './components/generic/DropUpSelector';
import Slider from './components/generic/Slider';
import ToggleButton from './components/generic/ToggleButton';

const items = ['Vanilla', { id: 1, label: 'React'}, { id: 2, label: 'Angular' }, { id: 3, label: 'Vue' }, { id: 4, label: 'Elm' }];

function getTableRowsFromState(state) {
    return Object.entries(state).map((e, i) => {
        return <tr key={`row-${i}`}><td>{e[0]}</td><td>{e[1]}</td></tr>
    });
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    
  handleToggleClick = (value) => {
      this.setState({ isToggleOn: value ? 'Yes' : 'No' })
  }
  
  handleSelection = (item) => {
    this.setState({ selectedItem: item && (item.label || item) });
  };
    
  handleSliderValueChange = (value) => {
      this.setState({ sliderValue: value });
  }

    handleSliderDragValueChange = (value) => {
        this.setState({ sliderDragValue: value });
    }
    
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <div>
            <div className="widget-bar">
                <ToggleButton onToggle={this.handleToggleClick} isOn={this.state.isToggleOn} toggledOffContent="🔈" toggledOnContent="🔇" />
                <DropUpSelector collapsedToggleContent="+" expandedToggleContent="-" items={items} onSelect={this.handleSelection} />
                <Slider value={333} maxValue={666} onValueChange={this.handleSliderValueChange} onDrag={this.handleSliderDragValueChange}/>
            </div>
            <div className="reported-state">
                <table>
                    {getTableRowsFromState(this.state)}
                </table>
            </div>
        </div>
      </div>
    );
  }
}

export default App;
