(window.webpackJsonp=window.webpackJsonp||[]).push([[34],{"./src/replay/docs/custom-player/custom-strings-graphics.mdx":function(e,t,n){"use strict";n.r(t),n.d(t,"default",(function(){return p}));var a=n("./node_modules/react/index.js"),o=n.n(a),r=n("./node_modules/@mdx-js/tag/dist/index.js");function s(e,t){if(null==e)return{};var n,a,o=function(e,t){if(null==e)return{};var n,a,o={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}class p extends o.a.Component{constructor(e){super(e),this.layout=null}render(){const e=this.props,t=e.components;s(e,["components"]);return o.a.createElement(r.MDXTag,{name:"wrapper",components:t},o.a.createElement(r.MDXTag,{name:"h1",components:t,props:{id:"how-to-change-graphics-or-texts"}},"How to change graphics or texts"),o.a.createElement(r.MDXTag,{name:"p",components:t},"This chapter describes how to customise either the texts (strings) used in the player, or the graphics (icons). For instance internationalisation can be implemented by composing a custom player with a different set of strings."),o.a.createElement(r.MDXTag,{name:"p",components:t},"Similarly, a different design can be set up in a custom player by passing a different set of icons. Icons can be specified as characters in special fonts (along with CSS importing and defining the font face), SVG, or even bitmaps in ",o.a.createElement(r.MDXTag,{name:"inlineCode",components:t,parentName:"p"},"<img/>")," elements if desired."),o.a.createElement(r.MDXTag,{name:"p",components:t},"One or both of these sets can be combined when creating a custom player, and also along with a custom player UI render method."),o.a.createElement(r.MDXTag,{name:"h2",components:t,props:{id:"the-player-composer"}},"The player composer"),o.a.createElement(r.MDXTag,{name:"p",components:t},"The easiest approach to replace the set of strings/and or graphics, is to use the ",o.a.createElement(r.MDXTag,{name:"inlineCode",components:t,parentName:"p"},"composePlayer()")," method. It produces a React component from what's typically being subject to customisation."),o.a.createElement(r.MDXTag,{name:"p",components:t},"As a starting point, this is how the ",o.a.createElement(r.MDXTag,{name:"a",components:t,parentName:"p",props:{href:"https://github.com/vimond/replay/blob/master/src/replay/default-player/Replay.js"}},"default Replay player")," is composed, with parameters specifying the strings and graphics to be part of the Replay component:"),o.a.createElement(r.MDXTag,{name:"pre",components:t},o.a.createElement(r.MDXTag,{name:"code",components:t,parentName:"pre",props:{className:"language-javascript"}},"import composePlayer from '../playerComposer';\nimport graphics from './default-skin/graphics';\nimport strings from './strings';\n\nconst Replay = composePlayer({\n  name: 'Replay',\n  graphics,\n  strings\n});\n\n// This is the component to be consumed in a full React SPA.\nexport default Replay;\n")),o.a.createElement(r.MDXTag,{name:"h2",components:t,props:{id:"how-are-texts-and-graphics-defined"}},"How are texts and graphics defined?"),o.a.createElement(r.MDXTag,{name:"p",components:t},"The ",o.a.createElement(r.MDXTag,{name:"a",components:t,parentName:"p",props:{href:"https://github.com/vimond/replay/blob/master/src/replay/default-player/strings.js"}},"default strings"),", as referred by the composition of the Replay player, are grouped by controls. The properties for each controls correspond to actually prop types expected by the control. Most of the strings are tooltip texts, with some exceptions."),o.a.createElement(r.MDXTag,{name:"p",components:t},"Similarly, for the ",o.a.createElement(r.MDXTag,{name:"a",components:t,parentName:"p",props:{href:"https://github.com/vimond/replay/blob/master/src/replay/default-player/default-skin/graphics.js"}},"graphics for the default skin"),", the definitions are structured per control or component. Here, the property values are mainly SVG graphics from the ",o.a.createElement(r.MDXTag,{name:"a",components:t,parentName:"p",props:{href:"https://feathericons.com/"}},"Feather")," icon set, wrapped as React components, so that they can be rendered within the control directly."),o.a.createElement(r.MDXTag,{name:"p",components:t},"Again, the property keys refer to prop names of the controls. Graphics can be added to all props with type ",o.a.createElement(r.MDXTag,{name:"inlineCode",components:t,parentName:"p"},"React.Node"),", as listed in the controls reference. And as long as the property values are accepted by React and the browser, the graphics or content can be any element types."),o.a.createElement(r.MDXTag,{name:"h2",components:t,props:{id:"replacing-the-strings-or-graphics-sets"}},"Replacing the strings or graphics sets"),o.a.createElement(r.MDXTag,{name:"p",components:t},"It is recommended to create a copy of the mentioned files as a start point, and perform the desired modifications. If also the control set (player UI) is different, properties for new controls might be added to the definitions, or unused definitions removed."),o.a.createElement(r.MDXTag,{name:"p",components:t},"A custom player component can then be created by referring and passing in the (in this case imaginary) new files to the player composer:"),o.a.createElement(r.MDXTag,{name:"pre",components:t},o.a.createElement(r.MDXTag,{name:"code",components:t,parentName:"pre",props:{className:"language-javascript"}},"import composePlayer from 'vimond-replay/playerComposer';\nimport graphics from './my-custom-skin/graphics';\nimport strings from './my-localization/strings-nn_no';\n\nconst CustomPlayer = composePlayer({\n  name: 'CustomPlayer',\n  graphics,\n  strings\n});\n\nexport default CustomPlayer;\n")),o.a.createElement(r.MDXTag,{name:"p",components:t},"The resulting player component can be used just like Replay."),o.a.createElement(r.MDXTag,{name:"pre",components:t},o.a.createElement(r.MDXTag,{name:"code",components:t,parentName:"pre",props:{className:"language-jsx"}},'<CustomPlayer source="..." />\n')),o.a.createElement(r.MDXTag,{name:"h2",components:t,props:{id:"combining-new-texts-andor-graphics-with-a-custom-ui"}},"Combining new texts and/or graphics with a custom UI"),o.a.createElement(r.MDXTag,{name:"p",components:t},"If also adding a custom UI through a ",o.a.createElement(r.MDXTag,{name:"a",components:t,parentName:"p",props:{href:"/custom-player/add-controls-components#adding-a-title-overlay---step-by-step"}},"custom player UI render method"),", the custom set of strings or graphics should be imported and included directly in the render method. How to this, is shown in the referred example."))}}p.__docgenInfo={description:"",methods:[],displayName:"MDXContent"}}}]);
//# sourceMappingURL=docs-custom-player-custom-strings-graphics.518f99f9b9150b00e2f5.js.map