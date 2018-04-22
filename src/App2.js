import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';


function debugChildren(children, level) {
    React.Children.forEach(children, (c,i) => {
        console.log('Level %s, child %s: of type %s', level, i, c.type || 'text', c);
        if (c.props && c.props.children) {
            debugChildren(c.props.children, level+1);
        }
    });
    
}

class Wrapping extends Component {
    
    
    render() {
        debugChildren(this.props.children, 1);
        return this.props.children;
    }
}

function Yep() {
    return <span>Yep.</span>
}

class App extends Component {
    render() {
        return (
            <Wrapping>
                <div className="App">
                    <header className="App-header">
                        <img src={logo} className="App-logo" alt="logo" />
                        <h1 className="App-title">Welcome to React</h1>
                    </header>
                    <p className="App-intro">
                        To get started, edit <code>src/App.js</code> and save to reload.
                        <Yep/>
                    </p>
                </div>
            </Wrapping>
        );
    }
}

export default App;
