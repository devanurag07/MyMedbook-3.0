/*! For license information please see 13.04b953c6.chunk.js.LICENSE.txt */
(this["webpackJsonpqueue-management"]=this["webpackJsonpqueue-management"]||[]).push([[13],{181:function(e,n,t){"use strict";t.r(n),t.d(n,"getScrollbarWidth",(function(){return a})),t.d(n,"setScrollbarWidth",(function(){return c})),t.d(n,"isBodyOverflowing",(function(){return s})),t.d(n,"getOriginalBodyPadding",(function(){return l})),t.d(n,"conditionallyUpdateScrollbar",(function(){return d})),t.d(n,"setGlobalCssModule",(function(){return u})),t.d(n,"mapToCssModules",(function(){return f})),t.d(n,"omit",(function(){return p})),t.d(n,"pick",(function(){return m})),t.d(n,"warnOnce",(function(){return h})),t.d(n,"deprecated",(function(){return y})),t.d(n,"DOMElement",(function(){return g})),t.d(n,"targetPropType",(function(){return x})),t.d(n,"tagPropType",(function(){return v})),t.d(n,"TransitionTimeouts",(function(){return O})),t.d(n,"TransitionPropTypeKeys",(function(){return w})),t.d(n,"TransitionStatuses",(function(){return E})),t.d(n,"keyCodes",(function(){return N})),t.d(n,"PopperPlacements",(function(){return T})),t.d(n,"canUseDOM",(function(){return k})),t.d(n,"isReactRefObj",(function(){return C})),t.d(n,"toNumber",(function(){return M})),t.d(n,"isObject",(function(){return _})),t.d(n,"isFunction",(function(){return D})),t.d(n,"findDOMElements",(function(){return S})),t.d(n,"isArrayOrNodeList",(function(){return R})),t.d(n,"getTarget",(function(){return I})),t.d(n,"defaultToggleEvents",(function(){return P})),t.d(n,"addMultipleEventListeners",(function(){return L})),t.d(n,"focusableElements",(function(){return U}));var r,o=t(21),i=t.n(o);function a(){var e=document.createElement("div");e.style.position="absolute",e.style.top="-9999px",e.style.width="50px",e.style.height="50px",e.style.overflow="scroll",document.body.appendChild(e);var n=e.offsetWidth-e.clientWidth;return document.body.removeChild(e),n}function c(e){document.body.style.paddingRight=e>0?e+"px":null}function s(){return document.body.clientWidth<window.innerWidth}function l(){var e=window.getComputedStyle(document.body,null);return parseInt(e&&e.getPropertyValue("padding-right")||0,10)}function d(){var e=a(),n=document.querySelectorAll(".fixed-top, .fixed-bottom, .is-fixed, .sticky-top")[0],t=n?parseInt(n.style.paddingRight||0,10):0;s()&&c(t+e)}function u(e){r=e}function f(e,n){return void 0===e&&(e=""),void 0===n&&(n=r),n?e.split(" ").map((function(e){return n[e]||e})).join(" "):e}function p(e,n){var t={};return Object.keys(e).forEach((function(r){-1===n.indexOf(r)&&(t[r]=e[r])})),t}function m(e,n){for(var t,r=Array.isArray(n)?n:[n],o=r.length,i={};o>0;)i[t=r[o-=1]]=e[t];return i}var b={};function h(e){b[e]||("undefined"!==typeof console&&console.error(e),b[e]=!0)}function y(e,n){return function(t,r,o){null!==t[r]&&"undefined"!==typeof t[r]&&h('"'+r+'" property of "'+o+'" has been deprecated.\n'+n);for(var i=arguments.length,a=new Array(i>3?i-3:0),c=3;c<i;c++)a[c-3]=arguments[c];return e.apply(void 0,[t,r,o].concat(a))}}var j="object"===typeof window&&window.Element||function(){};function g(e,n,t){if(!(e[n]instanceof j))return new Error("Invalid prop `"+n+"` supplied to `"+t+"`. Expected prop to be an instance of Element. Validation failed.")}var x=i.a.oneOfType([i.a.string,i.a.func,g,i.a.shape({current:i.a.any})]),v=i.a.oneOfType([i.a.func,i.a.string,i.a.shape({$$typeof:i.a.symbol,render:i.a.func}),i.a.arrayOf(i.a.oneOfType([i.a.func,i.a.string,i.a.shape({$$typeof:i.a.symbol,render:i.a.func})]))]),O={Fade:150,Collapse:350,Modal:300,Carousel:600},w=["in","mountOnEnter","unmountOnExit","appear","enter","exit","timeout","onEnter","onEntering","onEntered","onExit","onExiting","onExited"],E={ENTERING:"entering",ENTERED:"entered",EXITING:"exiting",EXITED:"exited"},N={esc:27,space:32,enter:13,tab:9,up:38,down:40,home:36,end:35,n:78,p:80},T=["auto-start","auto","auto-end","top-start","top","top-end","right-start","right","right-end","bottom-end","bottom","bottom-start","left-end","left","left-start"],k=!("undefined"===typeof window||!window.document||!window.document.createElement);function C(e){return!(!e||"object"!==typeof e)&&"current"in e}function A(e){return null==e?void 0===e?"[object Undefined]":"[object Null]":Object.prototype.toString.call(e)}function M(e){var n=typeof e;if("number"===n)return e;if("symbol"===n||"object"===n&&"[object Symbol]"===A(e))return NaN;if(_(e)){var t="function"===typeof e.valueOf?e.valueOf():e;e=_(t)?""+t:t}if("string"!==n)return 0===e?e:+e;e=e.replace(/^\s+|\s+$/g,"");var r=/^0b[01]+$/i.test(e);return r||/^0o[0-7]+$/i.test(e)?parseInt(e.slice(2),r?2:8):/^[-+]0x[0-9a-f]+$/i.test(e)?NaN:+e}function _(e){var n=typeof e;return null!=e&&("object"===n||"function"===n)}function D(e){if(!_(e))return!1;var n=A(e);return"[object Function]"===n||"[object AsyncFunction]"===n||"[object GeneratorFunction]"===n||"[object Proxy]"===n}function S(e){if(C(e))return e.current;if(D(e))return e();if("string"===typeof e&&k){var n=document.querySelectorAll(e);if(n.length||(n=document.querySelectorAll("#"+e)),!n.length)throw new Error("The target '"+e+"' could not be identified in the dom, tip: check spelling");return n}return e}function R(e){return null!==e&&(Array.isArray(e)||k&&"number"===typeof e.length)}function I(e,n){var t=S(e);return n?R(t)?t:null===t?[]:[t]:R(t)?t[0]:t}var P=["touchstart","click"];function L(e,n,t,r){var o=e;R(o)||(o=[o]);var i=t;if("string"===typeof i&&(i=i.split(/\s+/)),!R(o)||"function"!==typeof n||!Array.isArray(i))throw new Error("\n      The first argument of this function must be DOM node or an array on DOM nodes or NodeList.\n      The second must be a function.\n      The third is a string or an array of strings that represents DOM events\n    ");return Array.prototype.forEach.call(i,(function(e){Array.prototype.forEach.call(o,(function(t){t.addEventListener(e,n,r)}))})),function(){Array.prototype.forEach.call(i,(function(e){Array.prototype.forEach.call(o,(function(t){t.removeEventListener(e,n,r)}))}))}}var U=["a[href]","area[href]","input:not([disabled]):not([type=hidden])","select:not([disabled])","textarea:not([disabled])","button:not([disabled])","object","embed","[tabindex]:not(.modal)","audio[controls]","video[controls]",'[contenteditable]:not([contenteditable="false"])']},182:function(e,n,t){var r;!function(){"use strict";var t={}.hasOwnProperty;function o(){for(var e=[],n=0;n<arguments.length;n++){var r=arguments[n];if(r){var i=typeof r;if("string"===i||"number"===i)e.push(r);else if(Array.isArray(r)){if(r.length){var a=o.apply(null,r);a&&e.push(a)}}else if("object"===i)if(r.toString===Object.prototype.toString)for(var c in r)t.call(r,c)&&r[c]&&e.push(c);else e.push(r.toString())}}return e.join(" ")}e.exports?(o.default=o,e.exports=o):void 0===(r=function(){return o}.apply(n,[]))||(e.exports=r)}()},261:function(e,n,t){"use strict";var r=t(1),o=t(10),i=t(45),a=t(17),c=t(0),s=t.n(c),l=t(21),d=t.n(l),u=t(182),f=t.n(u),p=t(181),m=["active","aria-label","block","className","close","cssModule","color","outline","size","tag","innerRef"],b={active:d.a.bool,"aria-label":d.a.string,block:d.a.bool,color:d.a.string,disabled:d.a.bool,outline:d.a.bool,tag:p.tagPropType,innerRef:d.a.oneOfType([d.a.object,d.a.func,d.a.string]),onClick:d.a.func,size:d.a.string,children:d.a.node,className:d.a.string,cssModule:d.a.object,close:d.a.bool},h=function(e){function n(n){var t;return(t=e.call(this,n)||this).onClick=t.onClick.bind(Object(i.a)(t)),t}Object(a.a)(n,e);var t=n.prototype;return t.onClick=function(e){if(!this.props.disabled)return this.props.onClick?this.props.onClick(e):void 0;e.preventDefault()},t.render=function(){var e=this.props,n=e.active,t=e["aria-label"],i=e.block,a=e.className,c=e.close,l=e.cssModule,d=e.color,u=e.outline,b=e.size,h=e.tag,y=e.innerRef,j=Object(o.a)(e,m);c&&"undefined"===typeof j.children&&(j.children=s.a.createElement("span",{"aria-hidden":!0},"\xd7"));var g="btn"+(u?"-outline":"")+"-"+d,x=Object(p.mapToCssModules)(f()(a,{close:c},c||"btn",c||g,!!b&&"btn-"+b,!!i&&"btn-block",{active:n,disabled:this.props.disabled}),l);j.href&&"button"===h&&(h="a");var v=c?"Close":null;return s.a.createElement(h,Object(r.a)({type:"button"===h&&j.onClick?"button":void 0},j,{className:x,ref:y,onClick:this.onClick,"aria-label":t||v}))},n}(s.a.Component);h.propTypes=b,h.defaultProps={color:"secondary",tag:"button"},n.a=h},279:function(e,n,t){"use strict";t.r(n);var r=t(0),o=t.n(r),i=(t(328),t(403),t(406),t(46)),a=t(1158),c=t(246),s=t(261),l=t(323),d=(t(285),t(3));n.default=function(e){var n=e.medicine_list_,t=e.data,r=e.doctor_info,u=e.callBack,f=n||[],p=u||function(){},m=o.a.createRef(),b=t.customer_name?t.customer_name:"Undefined",h=t.mobile?t.mobile:"xxxx.xxxx.xx",y=void 0,j=Object(i.c)((function(e){return e.Auth.user}));y=void 0==r?j:r,console.log(y.your_sign);var g=y.clinic_name,x=y.full_name,v=(y.address_line1?y.address_line1:"")+"\n"+(y.address_line2?y.address_line2:"");return Object(d.jsxs)(a.a,{className:"prescription-pdf",id:"pdf-doc",ref:m,style:{background:"white",padding:"1em"},children:[Object(d.jsx)(a.a,{item:!0,xs:12,className:"mymedbook",children:Object(d.jsxs)(a.a,{container:!0,children:[Object(d.jsx)(a.a,{item:!0,xs:4,children:Object(d.jsxs)("h5",{children:[Object(d.jsx)("span",{className:"primary-font-color",children:"www."}),"mymedbook.in"]})}),Object(d.jsx)(a.a,{item:!0,xs:!0}),Object(d.jsxs)(a.a,{item:!0,xs:4,style:{display:"flex",justifyContent:"end",flexDirection:"column"},children:[Object(d.jsxs)("h5",{style:{textAlign:"end"},children:[Object(d.jsx)("span",{className:"primary-font-color",children:"Time - "}),function(e){var n=e.getHours(),t=e.getMinutes(),r=n>=12?"pm":"am";return(n=(n%=12)||12)+":"+(t=t<10?"0"+t:t)+" "+r}(new Date)," "]}),Object(d.jsxs)("h6",{style:{textAlign:"end"},children:[Object(d.jsx)("span",{className:"primary-font-color",children:"Date - "}),(new Date).toLocaleDateString()]})]})]})}),Object(d.jsxs)(a.a,{item:!0,xs:12,className:"pdf-header",id:"pdf-header",children:[Object(d.jsx)("div",{className:"clinic-name",id:"clinic-name",children:g}),Object(d.jsx)("div",{className:"doctor-name",children:x}),Object(d.jsx)("div",{className:"registration-no",children:"13232442"})]}),Object(d.jsxs)(a.a,{item:!0,xs:12,className:"patient-details",children:[Object(d.jsx)("h6",{children:"TO"}),Object(d.jsx)("h5",{children:b}),Object(d.jsx)("div",{className:"personal-info col-sm-12 row",children:Object(d.jsxs)("div",{className:"mobile-no",children:[Object(d.jsx)("span",{children:"Mobile no :"})," ",h]})})]}),Object(d.jsx)(a.a,{item:!0,xs:12,className:"medicine-list-cards",children:Object(d.jsx)(a.a,{item:!0,xs:12,children:f.map((function(e){var n=e.name?e.name:e.medicine_name,t=e.drug_to_taken;return Object(d.jsxs)(a.a,{item:!0,sm:12,className:"row col-sm-12",style:{justifyContent:"space-between",marginTop:"0.8em"},children:[" ",Object(d.jsxs)("div",{className:"medicine-name col-sm-5",children:[Object(d.jsx)("span",{children:" Medicine NAME"})," : ",Object(d.jsx)("p",{children:n})]}),Object(d.jsxs)("div",{className:"directions_of_intake col-sm-5",children:[Object(d.jsx)("span",{children:"Directions of Intake "})," :",Object(d.jsx)("p",{children:t})]})]})}))})}),Object(d.jsxs)(a.a,{container:!0,style:{marginTop:"2em",display:"flex",justifyContent:"space-between"},children:[Object(d.jsx)(a.a,{item:!0,sm:!0}),Object(d.jsx)(a.a,{item:!0,sm:!0,style:{display:"flex",justifyContent:"end"},children:Object(d.jsx)("img",{src:y.your_sign,alt:"",style:{width:"200px"}})})]}),Object(d.jsx)("footer",{style:{marginTop:"1em"},children:Object(d.jsx)("div",{className:"pdf-footer",children:v})}),Object(d.jsx)(s.a,{onClick:function(){l.a(document.getElementById("pdf-doc")).then((function(e){var n=new c.jsPDF("p","px","a4");n.internal.scaleFactor=10;var t=new Image;t.src=URL.createObjectURL(e,{type:"image/png"}),console.log(URL.createObjectURL(e,{type:"image/png"})),t.onload=function(r){var o=t.width,i=t.height;n.internal.pageSize.width=2*o,n.internal.pageSize.height=2*i,e.arrayBuffer().then((function(e){var t=new Uint8Array(e);n.addImage(t,"jpeg",0,0,2*o,2*i,"afs","NONE"),n.save("prescription-".concat(b,".pdf")),p()}))}}))},className:"btn btn-primary btn-sm",style:{marginTop:"3em"},children:"download"})]})}},328:function(e,n,t){}}]);
//# sourceMappingURL=13.04b953c6.chunk.js.map