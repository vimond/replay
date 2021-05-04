(window.webpackJsonp=window.webpackJsonp||[]).push([[16],{"./src/replay/components/common.js":function(e,t,n){"use strict";n.d(t,"a",(function(){return o})),n.d(t,"k",(function(){return r})),n.d(t,"g",(function(){return s})),n.d(t,"d",(function(){return i})),n.d(t,"f",(function(){return c})),n.d(t,"h",(function(){return l})),n.d(t,"i",(function(){return d})),n.d(t,"j",(function(){return m})),n.d(t,"c",(function(){return h})),n.d(t,"b",(function(){return y})),n.d(t,"e",(function(){return b}));const o="replay-";function r(e,...t){const n=null==e?"":e,o=[];for(let r=0;r<t.length;r++)t[r]&&o.push(n+t[r]);return o.join(" ")}const a=e=>e;function s({classes:e,selectClasses:t,classNames:n,classNamePrefix:o}){if(e&&t){const n=t(e);return Array.isArray(n)?n.filter(a).join(" "):n}if(n)return r(o,...n)}function i(e,t){const n=(t||e.currentTarget).getBoundingClientRect();let o;return o=e.touches&&e.touches.length>0?e.touches[0]:e.changedTouches&&e.changedTouches.length>0?e.changedTouches[0]:e,{x:Math.max(0,Math.min(o.pageX-n.left,n.width)),y:Math.max(0,Math.min(o.pageY-n.top,n.height)),width:n.width,height:n.height}}function c(e){return t=>{e.indexOf(t.key)>=0&&(t.preventDefault(),t.stopPropagation())}}const l=(e,t)=>e!==t&&(!(e instanceof Date&&t instanceof Date&&e.getTime()===t.getTime())&&!(Number.isNaN(e)&&Number.isNaN(t))),p=e=>null!=e&&e.constructor==={}.constructor,d=(e,t)=>{if(e===t)return!0;if(p(e)&&p(t)){const n=Object.keys(e),o=Object.keys(t);return n.length===o.length&&(!(n.filter(n=>l(e[n],t[n])).length>0)&&0===o.filter(n=>l(t[n],e[n])).length)}if(Array.isArray(e)&&Array.isArray(t)&&e.length===t.length){for(let n=e.length;n--;)if(e[n]!==t[n])return!1;return!0}return!1};function u(e){if(null==e)return{};{const t={},n=e;return Object.keys(e).forEach(e=>{p(n[e])?t[e]=u(n[e]):t[e]=n[e]}),t}}function m(e,t){const n=u(e);if(t){const e=t;Object.getOwnPropertyNames(e).forEach(t=>{p(e[t])?p(n[t])?n[t]=m(n[t],e[t]):n[t]=u(e[t]):n[t]=e[t]})}return n}const f=(e,t="",n=!1,o=!0)=>n&&0===e?"":e<10&&o?"0".concat(e).concat(t):"".concat(e).concat(t),h=(e,t="-")=>{let n=Math.round(e),o="";"number"!==typeof e||isNaN(e)||e===1/0?n=0:n<0&&(n=-n,o=t);const r=Math.floor(n/86400),a=86400*r,s=Math.floor((n-a)/3600),i=a+3600*s,c=Math.floor((n-i)/60),l=n-i-60*c;return o+f(r,".",!0,!1)+f(s,":",0===r)+f(c,":",!1)+f(l)},y=e=>{const t=e instanceof Date&&!isNaN(e.getTime());let n=0,o=0,r=0;return t&&null!=e&&(n=t?e.getHours():0,o=t?e.getMinutes():0,r=t?e.getSeconds():0),f(n,":",!1)+f(o,":",!1)+f(r)},b=(e,t)=>{let n=null;return{start:()=>{n||(n=setInterval(e,1e3*t))},stop:()=>{n&&(clearInterval(n),n=null)}}}},"./src/replay/components/controls/SkipButton/SkipButton.js":function(e,t,n){"use strict";var o=n("./node_modules/react/index.js"),r=n("./src/replay/components/generic/Button/Button.js"),a=n("./src/replay/components/common.js");function s(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}class i extends o.Component{constructor(...e){super(...e),s(this,"handleClick",()=>{const e=this.props.setProperties;if(e){const t=("function"===typeof this.props.inspect?this.props.inspect().position:this.props.position)+this.props.offset;isNaN(t)||e({position:t})}})}render(){const e=this.props,t=e.content,n=e.label,a=e.classNamePrefix;return o.createElement(r.a,{classNamePrefix:a,className:"skip-button",label:n,onClick:this.handleClick,content:t})}}s(i,"defaultProps",{classNamePrefix:a.a,offset:-30}),i.displayName="SkipButton",t.a=i,i.__docgenInfo={description:"",methods:[{name:"handleClick",docblock:null,modifiers:[],params:[],returns:null}],displayName:"SkipButton",props:{classNamePrefix:{defaultValue:{value:"defaultClassNamePrefix",computed:!0},required:!1},offset:{defaultValue:{value:"-30",computed:!1},required:!1,flowType:{name:"number"},description:"Configures the offset that will be added to the current position when clicking the button. Negative values mean skipping backward."},position:{required:!1,flowType:{name:"number"},description:"The position from which the skipped position is computed. Not recommended to set this, but rather provide inspect()."},content:{required:!0,flowType:{name:"ReactNode",raw:"React.Node"},description:"Button content, e.g. icon."},inspect:{required:!1,flowType:{name:"InspectMethod"},description:"\u21d8\ufe0e A callback returning the current video stream state with a position property when invoked. Invoked on clicking the button, and the position property is used for computing the new position."},setProperties:{required:!1,flowType:{name:"signature",type:"function",raw:"({ position: number }) => void",signature:{arguments:[{name:"",type:{name:"signature",type:"object",raw:"{ position: number }",signature:{properties:[{key:"position",value:{name:"number",required:!0}}]}}}],return:{name:"void"}}},description:"\u21d7 When the button is clicked, this callback is invoked with an object having a position property with the computed new position based on the skip offset."}}}},"./src/replay/components/controls/SkipButton/SkipButton.mdx":function(e,t,n){"use strict";n.r(t),n.d(t,"default",(function(){return h}));var o=n("./node_modules/react/index.js"),r=n.n(o),a=n("./node_modules/@mdx-js/tag/dist/index.js"),s=n("./node_modules/docz/dist/index.m.js"),i=n("./src/replay/components/controls/TimeDisplay/TimeDisplay.js"),c=n("./src/replay/components/controls/SkipButton/SkipButton.js"),l=n("./src/replay/docs/mdx-helpers/ShowCase.js"),p=n("./src/replay/docs/mdx-helpers/SimpleTable.js"),d=n("./node_modules/react-feather/dist/icons/rotate-ccw.js"),u=n("./node_modules/react-feather/dist/icons/rotate-cw.js"),m=n("./src/replay/docs/props-footnote.md");function f(e,t){if(null==e)return{};var n,o,r=function(e,t){if(null==e)return{};var n,o,r={},a=Object.keys(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}class h extends r.a.Component{constructor(e){super(e),this.layout=null}render(){const e=this.props,t=e.components,n=f(e,["components"]);return r.a.createElement(a.MDXTag,{name:"wrapper",components:t},r.a.createElement(a.MDXTag,{name:"h1",components:t,props:{id:"skipbutton"}},"SkipButton"),r.a.createElement(a.MDXTag,{name:"p",components:t},"Control bar button for seeking by offsets. "),r.a.createElement(a.MDXTag,{name:"h2",components:t,props:{id:"summary"}},"Summary"),r.a.createElement(a.MDXTag,{name:"p",components:t},"The offset in seconds and direction can be configured, and this control can be used for both seeking forward and backward by relatively small intervals, e.g. 20 seconds, which is often more convenient than using the timeline slider."),r.a.createElement(a.MDXTag,{name:"p",components:t},"When clicking the button, ",r.a.createElement(a.MDXTag,{name:"inlineCode",components:t,parentName:"p"},"setProperties({ position: value })")," will be called, with the value computed by adding the current position with the configured ",r.a.createElement(a.MDXTag,{name:"inlineCode",components:t,parentName:"p"},"offset")," prop. This means negative configured offsets will make the button skip backward."),r.a.createElement(a.MDXTag,{name:"p",components:t},"When clicking the button, the current relative position is read by invoking the callback prop ",r.a.createElement(a.MDXTag,{name:"inlineCode",components:t,parentName:"p"},"inspect()"),". This is a method of the player controller, passed down when ",r.a.createElement(a.MDXTag,{name:"a",components:t,parentName:"p",props:{href:"/architecture/connected-controls#connecting-the-controls"}},"connecting the control"),". It exposes the current video streamer state. The button could also read the prop ",r.a.createElement(a.MDXTag,{name:"inlineCode",components:t,parentName:"p"},"position"),". However, this would require continuous updates to the button during playback of the position value, and would be unnecessary as long as the button is not clicked."),r.a.createElement(a.MDXTag,{name:"h2",components:t,props:{id:"example"}},"Example"),r.a.createElement(s.Playground,{__codesandbox:"undefined",__position:0,__code:"<ShowCase\n  render={({ setProperties, position = 180 }) => {\n    // Preferrably only fetch the position upon clicks, instead of updating a position prop.\n    // The PlayerController provides an inspect() method to connected controls, which is mocked here:\n    const duration = 600\n    const inspect = () => {\n      return { position: Math.min(position, duration) }\n    }\n    return (\n      <>\n        <SkipButton\n          offset={-20}\n          inspect={inspect}\n          content={<RotateCcw />}\n          setProperties={setProperties}\n        />\n        <TimeDisplay\n          position={position}\n          duration={duration}\n          playMode={'ondemand'}\n        />\n        <SkipButton\n          offset={40}\n          inspect={inspect}\n          content={<RotateCw />}\n          setProperties={setProperties}\n        />\n      </>\n    )\n  }}\n/>",__scope:{props:this?this.props:n,TimeDisplay:i.a,SkipButton:c.a,ShowCase:l.a,SimpleTable:p.a,RotateCcw:d.a,RotateCw:u.a,Footnote:m.a}},r.a.createElement(l.a,{render:({setProperties:e,position:t=180})=>{const n=()=>({position:Math.min(t,600)});return r.a.createElement(r.a.Fragment,null,r.a.createElement(c.a,{offset:-20,inspect:n,content:r.a.createElement(d.a,null),setProperties:e}),r.a.createElement(i.a,{position:t,duration:600,playMode:"ondemand"}),r.a.createElement(c.a,{offset:40,inspect:n,content:r.a.createElement(u.a,null),setProperties:e}))}})),r.a.createElement(a.MDXTag,{name:"p",components:t},"This example demonstrates both forward and backward skip buttons configured with different intervals. It uses ",r.a.createElement(a.MDXTag,{name:"inlineCode",components:t,parentName:"p"},"<TimeDisplay/>")," for showing the effect of button clicks."),r.a.createElement(a.MDXTag,{name:"h2",components:t,props:{id:"props"}},"Props"),r.a.createElement(s.PropsTable,{of:c.a}),r.a.createElement(m.a,null),r.a.createElement(a.MDXTag,{name:"h2",components:t,props:{id:"component-dom-with-class-names"}},"Component DOM with class names"),r.a.createElement(a.MDXTag,{name:"p",components:t},"Please read the ",r.a.createElement(a.MDXTag,{name:"a",components:t,parentName:"p",props:{href:"/custom-replay/skins-styles"}},"general principles")," for Replay class names and styling."),r.a.createElement(p.a,{rows:[{Element:"div","Class name":"skip-button","Generic class name":"button",States:"",Parent:""},{Element:"div","Class name":"","Generic class name":"",States:"",Parent:".skip-button"}]}))}}h.__docgenInfo={description:"",methods:[],displayName:"MDXContent"}},"./src/replay/components/controls/TimeDisplay/TimeDisplay.js":function(e,t,n){"use strict";var o=n("./node_modules/react/index.js"),r=n("./src/replay/components/common.js");const a=(e,t,n=!1)=>Object(r.c)(null==e?0:Math[n?"min":"max"](0,e),t),s=({position:e,duration:t,absolutePosition:n,playMode:s,liveDisplayMode:i="clock-time",negativeMark:c,label:l,positionLabel:p,durationLabel:d,clockTimeLabel:u,classNamePrefix:m=r.a})=>{return"ondemand"===s?o.createElement("div",{className:Object(r.k)(m,"time-display"),title:l},o.createElement("span",{className:Object(r.k)(m,"time-display-position"),title:p},a(e,c)),o.createElement("span",{className:Object(r.k)(m,"time-display-duration"),title:d},a(t,c))):("live-offset"!==i||"livedvr"!==s)&&((f=n)instanceof Date&&!isNaN(f.getTime())&&f.getTime()>15147612e5)?o.createElement("div",{className:Object(r.k)(m,"time-display","time-display-no-duration"),title:l},o.createElement("span",{className:Object(r.k)(m,"time-display-clock-time"),title:p},Object(r.b)(n))):o.createElement("div",{className:Object(r.k)(m,"time-display"),title:l},o.createElement("span",{className:Object(r.k)(m,"time-display-position"),title:p},a((e||t||0)-(t||0),c,!0)),"livedvr"===s&&o.createElement("span",{className:Object(r.k)(m,"time-display-duration"),title:d},a(t,c)));var f};s.streamStateKeysForObservation=["position","duration","absolutePosition","playMode"],s.displayName="TimeDisplay",t.a=s,s.__docgenInfo={description:"",methods:[],displayName:"TimeDisplay",props:{liveDisplayMode:{defaultValue:{value:"'clock-time'",computed:!1},required:!1,flowType:{name:"union",raw:"'clock-time' | 'live-offset'",elements:[{name:"literal",value:"'clock-time'"},{name:"literal",value:"'live-offset'"}]},description:"When set to 'live-offset', DVR times will be displayed as offsets from the live edge. Default is 'clock-time'."},classNamePrefix:{defaultValue:{value:"defaultClassNamePrefix",computed:!0},required:!1},position:{required:!1,flowType:{name:"number"},description:"\u21d8\ufe0e The relative playback position, used for on demand position and timeshift offset display."},duration:{required:!1,flowType:{name:"number"},description:"\u21d8\ufe0e The duration of the stream, used for on demand position and timeshift offset display."},absolutePosition:{required:!1,flowType:{name:"Date",nullable:!0},description:"\u21d8\ufe0e The clock time, used for live streams and DVR streams when liveDisplayMode is set to 'live-offset'."},playMode:{required:!1,flowType:{name:"PlayMode"},description:"\u21d8\ufe0e Play mode is used to decide what times to display."},negativeMark:{required:!1,flowType:{name:"string"},description:""},positionLabel:{required:!1,flowType:{name:"string"},description:""},durationLabel:{required:!1,flowType:{name:"string"},description:""},clockTimeLabel:{required:!1,flowType:{name:"string"},description:""}}}},"./src/replay/components/generic/Button/Button.js":function(e,t,n){"use strict";var o=n("./node_modules/react/index.js"),r=n("./src/replay/components/common.js");function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}const s=e=>e.button;class i extends o.Component{constructor(...e){super(...e),a(this,"handleClick",()=>this.props.onClick&&this.props.onClick()),a(this,"handleKeyDown",Object(r.f)(["Enter"," "])),a(this,"handleKeyUp",e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this.handleClick())})}render(){const e=this.props,t=e.label,n=e.className,a=e.classNamePrefix,i=e.classes,c=e.content,l=Object(r.g)({classes:i,selectClasses:s,classNames:["button",n],classNamePrefix:a});return o.createElement("div",{title:t,onClick:this.handleClick,onKeyDown:this.handleKeyDown,onKeyUp:this.handleKeyUp,className:l,role:"button",tabIndex:0},o.createElement("div",{tabIndex:-1},c))}}a(i,"defaultProps",{useDefaultClassNaming:!0}),t.a=i,i.__docgenInfo={description:"",methods:[{name:"handleClick",docblock:null,modifiers:[],params:[],returns:null},{name:"handleKeyUp",docblock:null,modifiers:[],params:[{name:"keyboardEvent",type:{name:"KeyboardEvent",alias:"KeyboardEvent"}}],returns:null}],displayName:"Button",props:{useDefaultClassNaming:{defaultValue:{value:"true",computed:!1},required:!1},label:{required:!1,flowType:{name:"string"},description:""},content:{required:!1,flowType:{name:"ReactNode",raw:"React.Node"},description:""},onClick:{required:!1,flowType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}}},"./src/replay/docs/mdx-helpers/ShowCase.js":function(e,t,n){"use strict";var o=n("./node_modules/react/index.js");n("./src/replay/replay-default.css");function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}class s extends o.Component{constructor(e){super(e),a(this,"setProperties",e=>this.setState((e=>{const t={};return Object.keys(e).forEach(n=>{let o=e[n];switch(n){case"selectedAudioTrack":t.currentAudioTrack=o;break;case"selectedTextTrack":t.currentTextTrack=o;break;default:t[n]=o}}),t})(e))),this.state={}}render(){const e=this.setProperties,t=this.state,n=this.props,s=n.render,i=n.height,c=i?{width:"100%",height:i}:{width:"100%"};return o.createElement("div",null,o.createElement("div",{style:c}),o.createElement("div",{className:"replay-controls-bar",style:{justifyContent:"center"}},s(function(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}({},t,{setProperties:e}))))}}t.a=s,s.__docgenInfo={description:"",methods:[{name:"setProperties",docblock:null,modifiers:[],params:[{name:"props",type:{name:"PlaybackProps",alias:"PlaybackProps"}}],returns:null}],displayName:"ShowCase",props:{render:{required:!0,flowType:{name:"signature",type:"function",raw:"(VideoStreamState & { setProperties: PlaybackProps => void }) => React.Node",signature:{arguments:[{name:"",type:{name:"intersection",raw:"VideoStreamState & { setProperties: PlaybackProps => void }",elements:[{name:"VideoStreamState"},{name:"signature",type:"object",raw:"{ setProperties: PlaybackProps => void }",signature:{properties:[{key:"setProperties",value:{name:"signature",type:"function",raw:"PlaybackProps => void",signature:{arguments:[{name:"",type:{name:"PlaybackProps"}}],return:{name:"void"}},required:!0}}]}}]}}],return:{name:"ReactNode",raw:"React.Node"}}},description:""},height:{required:!1,flowType:{name:"string"},description:""}}}},"./src/replay/docs/mdx-helpers/SimpleTable.js":function(e,t,n){"use strict";var o=n("./node_modules/react/index.js");function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){s(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}const i={padding:0,tableLayout:"auto",boxShadow:"0 0 0 1px #CED4DE",borderSpacing:0,borderColor:"gray",borderCollapse:"collapse",borderStyle:"hidden",borderRadius:"4px",overflowY:"hidden",fontSize:"14px",color:"#13161F",width:"100%",display:"table"},c={color:"#7D899C",background:"#EEF1F5",textAlign:"left",fontSize:"14px",borderSpacing:0,borderCollapse:"collapse"},l={orderSpacing:0,borderCollapse:"collapse"},p={padding:"20px",verticalAlign:"top"},d=a({},p,{fontStyle:"italic",opacity:.5}),u=a({},p,{fontFamily:'"Source Code Pro",monospace',whiteSpace:"nowrap"}),m=({rows:e})=>{const t=e?e.map(e=>Object.values(e).join("-")).join("-"):"";if(e&&e.length){const n=Object.keys(e[0]);return o.createElement("table",{style:i},o.createElement("thead",{style:c},o.createElement("tr",{style:l},n.map(e=>o.createElement("th",{key:"header-"+e,style:p},e)))),o.createElement("tbody",null,e.map((e,n)=>o.createElement("tr",{key:t+"-row-"+n,style:l},Object.values(e).map((e,r)=>{return o.createElement("td",{key:t+"-cell-"+n+"-"+r,style:(a=e,""===a?d:u)},(e=>""===e?"none":e)(e));var a})))))}};t.a=m,m.__docgenInfo={description:"",methods:[],displayName:"SimpleTable",props:{rows:{required:!1,flowType:{name:"Array",elements:[{name:"signature",type:"object",raw:"{ [string]: string }",signature:{properties:[{key:{name:"string"},value:{name:"string",required:!0}}]}}],raw:"Array<{ [string]: string }>"},description:""}}}},"./src/replay/docs/props-footnote.md":function(e,t,n){"use strict";n.d(t,"a",(function(){return i}));var o=n("./node_modules/react/index.js"),r=n.n(o),a=n("./node_modules/@mdx-js/tag/dist/index.js");function s(e,t){if(null==e)return{};var n,o,r=function(e,t){if(null==e)return{};var n,o,r={},a=Object.keys(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}class i extends r.a.Component{constructor(e){super(e),this.layout=null}render(){const e=this.props,t=e.components;s(e,["components"]);return r.a.createElement(a.MDXTag,{name:"wrapper",components:t},r.a.createElement(a.MDXTag,{name:"p",components:t},"Props marked with \u21d8 are updated with the video streamer's ",r.a.createElement(a.MDXTag,{name:"a",components:t,parentName:"p",props:{href:"/reference/observable-stream-state"}},"state property")," having the same name, when connected by the ",r.a.createElement(a.MDXTag,{name:"a",components:t,parentName:"p",props:{href:"/architecture/connected-controls#connecting-the-controls"}},r.a.createElement(a.MDXTag,{name:"inlineCode",components:t,parentName:"a"},"connectControl()")," HOC"),". The \ufe0e",r.a.createElement(a.MDXTag,{name:"inlineCode",components:t,parentName:"p"},"setProperties()")," callback prop is marked with \ufe0e\u21d7 because it is connected for changing the playback state. More info in the architecture description of ",r.a.createElement(a.MDXTag,{name:"a",components:t,parentName:"p",props:{href:"/architecture/overview#arrows-and-boxes"}},"two-way data flow"),"."))}}i.__docgenInfo={description:"",methods:[],displayName:"MDXContent"}},"./src/replay/replay-default.css":function(e,t,n){}}]);
//# sourceMappingURL=components-controls-skip-button-skip-button.f011f4acf24b3a1d3f2c.js.map