(window.webpackJsonp=window.webpackJsonp||[]).push([[30],{"./src/replay/docs/architecture/player-controller.mdx":function(e,t,n){"use strict";n.r(t),n.d(t,"default",(function(){return s}));var r=n("./node_modules/react/index.js"),o=n.n(r),a=n("./node_modules/@mdx-js/tag/dist/index.js");function c(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}class s extends o.a.Component{constructor(e){super(e),this.layout=null}render(){const e=this.props,t=e.components;c(e,["components"]);return o.a.createElement(a.MDXTag,{name:"wrapper",components:t},o.a.createElement(a.MDXTag,{name:"h1",components:t,props:{id:"player-controller"}},"Player controller"),o.a.createElement(a.MDXTag,{name:"p",components:t},"This is one specific component, ",o.a.createElement(a.MDXTag,{name:"inlineCode",components:t,parentName:"p"},"<PlayerController/>"),", inserted once near the root of the React player element tree in the Replay player. The same is recommended for custom players. It takes a video streamer as a child component, and excepts a render method prop taking care of the player UI. "),o.a.createElement(a.MDXTag,{name:"p",components:t},"The video streamer child is targeted for observation and manipulation by the player controller. It uses the controller React context for exposing the video streamer state and possible operations to the React element tree rendered in the render prop."),o.a.createElement(a.MDXTag,{name:"p",components:t},o.a.createElement(a.MDXTag,{name:"a",components:t,parentName:"p",props:{href:"/architecture/background#the-player-controller-and-its-nice-react-fit"}},"More about the considerations behind, and the concerns covered by the player controller"),"."))}}s.__docgenInfo={description:"",methods:[],displayName:"MDXContent"}}}]);
//# sourceMappingURL=docs-architecture-player-controller.f011f4acf24b3a1d3f2c.js.map