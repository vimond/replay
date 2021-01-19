(window.webpackJsonp=window.webpackJsonp||[]).push([[49],{"./src/replay/components/player/VideoStreamer/HtmlVideoStreamer/HtmlVideoStreamer.js":function(e,t,n){"use strict";n.r(t);var r=n("./src/replay/components/player/VideoStreamer/common/createVideoStreamerComponent.js"),a=n("./src/replay/components/player/VideoStreamer/BasicVideoStreamer/BasicVideoStreamer.js"),i=n("./src/replay/components/player/VideoStreamer/types.js"),o=n("./src/replay/components/player/VideoStreamer/BasicVideoStreamer/sourceChangeHandler.js"),s=n("./src/replay/components/player/VideoStreamer/common/sourceNormalizer.js");function c(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}const l="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";class u extends Error{constructor(e,t,n,r){super(n),c(this,"status",void 0),c(this,"url",void 0),c(this,"method",void 0),this.status=e,this.url=t,this.method=r}}function d(e,t,n,r="GET"){return new i.a("STREAM_ERROR_DOWNLOAD","html",n,"FATAL",new u(e.status,t,n,r))}function f(e){const t=new ArrayBuffer(2*e.length),n=new Uint16Array(t);for(let r=0,a=e.length;r<a;r++)n[r]=e.charCodeAt(r);return n}function y(e){return String.fromCharCode.apply(null,new Uint16Array(e.buffer))}function m(e){let t,n,r,a,i,o,s,c="",u=0;for(;u<e.length;)t=e[u++],n=u<e.length?e[u++]:Number.NaN,r=u<e.length?e[u++]:Number.NaN,a=t>>2,i=(3&t)<<4|n>>4,o=(15&n)<<2|r>>6,s=63&r,isNaN(n)?o=s=64:isNaN(r)&&(s=64),c+=l.charAt(a)+l.charAt(i)+l.charAt(o)+l.charAt(s);return c}function p(e,t,n,r){"string"===typeof n?n=f(n):"number"===typeof n&&(n=f(""+n));let a=0;const i=new ArrayBuffer(t.byteLength+4+n.byteLength+4+r.byteLength),o=new DataView(i);new Uint8Array(i,a,t.byteLength).set(t),a+=t.byteLength,o.setUint32(a,n.byteLength,!0),a+=4;const s=e?new Uint8Array(i,a,n.byteLength):new Uint16Array(i,a,n.length);return s.set(n),a+=s.byteLength,o.setUint32(a,r.byteLength,!0),a+=4,new Uint8Array(i,a,r.byteLength).set(r),new Uint8Array(i,0,i.byteLength)}const w=(e,t,n,r)=>{if(!t||!("WebKitMediaKeys"in window))return;const a=t.contentIdExtractMatch,o=t.fairPlayCertificateUrl,s=t.licenseRequestHeaders&&Object.entries(t.licenseRequestHeaders).map(([e,t])=>({name:e,value:t}))||[],c="binary"===t.requestFormat,l="base64"===t.requestFormat;let u=null,f=t.contentId,w=t.licenseUrl;function b(t){const n=t.initData,s=c?y(n).replace(/^.*:\/\//,""):f||function(e,t){const n=y(e),r=t?"string"===typeof t?new RegExp(t):t:/([0-9]+)$/;if(r.exec){const e=r.exec(n);return e&&e[0]}}(n,a);if(c?r&&r("Content ID extracted from initData.",f):f||r&&r("Content ID extracted from initData.",f),e.webkitKeys||e.webkitSetMediaKeys(new window.WebKitMediaKeys("com.apple.fps.1_0")),e.webkitKeys){if(!w){const e=y(n).substring(1);w=e.substring(e.indexOf("/",e.indexOf("://")+3))}if(s)if(u){if(!A(s,p(l,n,s,u)))return void L(new i.a("STREAM_ERROR_DRM_CLIENT_UNAVAILABLE","html","Could not create key session."))}else{const e=new XMLHttpRequest;e.responseType="arraybuffer",e.addEventListener("load",()=>{e.status&&e.status<400?(u=new Uint8Array(e.response),A(s,p(l,n,s,u))&&L(new i.a("STREAM_ERROR_DRM_CLIENT_UNAVAILABLE","html","Could not create key session."))):L(d(e,o,"Download of FairPlay certificate failed."))}),e.addEventListener("error",()=>L(d(e,o,"Download of FairPlay certificate was blocked.")),!1),e.addEventListener("timeout",()=>L(d(e,o,"Download of FairPlay certificate timed out.")),!1),e.open("GET",o,!0),e.send()}else L(new i.a("STREAM_ERROR","html","No content ID available. Cannot complete FairPlay license acquisition.","FATAL"))}else L(new i.a("STREAM_ERROR_DRM_CLIENT_UNAVAILABLE","html","Safari EME API not available."))}function A(t,n){const r=e.webkitKeys.createSession("video/mp4",n);if(!r)return!1;r.contentId=t,r.addEventListener("webkitkeymessage",h,!1),r.addEventListener("webkitkeyadded",R,!1),r.addEventListener("webkitkeyerror",E,!1)}function h(e){r&&r("Key session ready for license request.");const t=e.target,n=e.message,a=new XMLHttpRequest;a.responseType=c?"arraybuffer":"text",a.addEventListener("load",()=>{if(a.status&&a.status<400)if(c){const e=a.response;t.update(new Uint8Array(e))}else{let e=a.responseText.trim();"<ckc>"===e.substr(0,5)&&"</ckc>"===e.substr(-6)&&(e=e.slice(5,-6)),t.update(function(e){const t=window.atob(e),n=t.length,r=new Uint8Array(new ArrayBuffer(n));for(let a=0;a<n;a++)r[a]=t.charCodeAt(a);return r}(e))}else L(d(a,w,"Acquisition of FairPlay license failed.","POST"))}),a.addEventListener("error",()=>L(d(a,o,"Acquisition of FairPlay license was blocked.")),!1),a.addEventListener("timeout",()=>L(d(a,o,"Acquisition of FairPlay license timed out.")),!1),a.open("POST",w,!0),s.forEach((function({name:e,value:t}){a.setRequestHeader(e,t)})),c?(a.setRequestHeader("Content-type","application/octet-stream"),a.send(n)):l?a.send(m(n)):(a.setRequestHeader("Content-type","application/x-www-form-urlencoded"),a.send(function(e,t){return t?"contentId="+encodeURIComponent(t.toString())+"spc="+encodeURIComponent(m(e)):"spc="+encodeURIComponent(m(e))}(n,f)))}function R(e){r&&r("Decryption key added",e)}function E(e){const t=e.target&&e.target.error&&e.target.error.code||0;if(6===t||4===t){const t="FairPlay blocked the playback because of non-secure output path, e.g. external VGA screen connected.";L(new i.a("STREAM_ERROR_DRM_OUTPUT_BLOCKED","html",t,"FATAL",e.target&&e.target.error))}else L(new i.a("STREAM_ERROR_DECODE","html","Could not decrypt FairPlay stream.","FATAL",e.target&&e.target.error));g()}function g(){e.removeEventListener("webkitneedkey",b,!1)}function L(e){n&&n(e),g()}return e.addEventListener("webkitneedkey",b,!1),{cleanup:g}};var b=function(e){const t=Object(o.a)(e);let n;return(r,a)=>{n&&n.cleanup();const i=function(e,t){const n=Object(s.a)(e);if(n&&n.licenseUrl){const e=n.licenseUrl,r=t&&t.licenseAcquisition&&t.licenseAcquisition.fairPlay||{},a=n.licenseAcquisitionDetails||{},i=a.fairPlayCertificateUrl||r.serviceCertificateUrl,o=a.contentIdExtractMatch||r.contentIdExtractMatch,s=a.fairPlayRequestFormat||r.requestFormat||"formdata",c=a.licenseRequestHeaders,l=a.contentId;return i?{licenseUrl:e,licenseRequestHeaders:c,fairPlayCertificateUrl:i,requestFormat:s,contentId:l,contentIdExtractMatch:o}:null}return null}(r.source,r.configuration);return i&&(n=w(e,i,r.onPlaybackError)),t(r,a)}};const A=Object(r.a)("HtmlVideoStreamer",Object(a.getImplementationResolver)(b));t.default=A}}]);
//# sourceMappingURL=49.37452ea1ad8b4153a011.js.map