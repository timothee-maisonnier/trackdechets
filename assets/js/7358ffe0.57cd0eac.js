(self.webpackChunktd_doc=self.webpackChunktd_doc||[]).push([[8693],{3905:function(e,t,n){"use strict";n.d(t,{Zo:function(){return l},kt:function(){return m}});var r=n(67294);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=r.createContext({}),u=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},l=function(e){var t=u(e.components);return r.createElement(s.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,i=e.mdxType,a=e.originalType,s=e.parentName,l=c(e,["components","mdxType","originalType","parentName"]),d=u(n),m=i,f=d["".concat(s,".").concat(m)]||d[m]||p[m]||a;return n?r.createElement(f,o(o({ref:t},l),{},{components:n})):r.createElement(f,o({ref:t},l))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var a=n.length,o=new Array(a);o[0]=d;var c={};for(var s in t)hasOwnProperty.call(t,s)&&(c[s]=t[s]);c.originalType=e,c.mdxType="string"==typeof e?e:i,o[1]=c;for(var u=2;u<a;u++)o[u]=n[u];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},92615:function(e,t,n){"use strict";n.r(t),n.d(t,{frontMatter:function(){return c},contentTitle:function(){return s},metadata:function(){return u},toc:function(){return l},default:function(){return d}});var r=n(22122),i=n(19756),a=(n(67294),n(3905)),o=["components"],c={title:"Lien entre l'API et l'interface web Trackd\xe9chets"},s=void 0,u={unversionedId:"concepts/api-ui",id:"concepts/api-ui",isDocsHomePage:!1,title:"Lien entre l'API et l'interface web Trackd\xe9chets",description:"En plus de l'API Trackd\xe9chets, nous mettons \xe9galement \xe0 disposition une interface graphique qui permet plusieurs choses :",source:"@site/docs/concepts/api-ui.md",sourceDirName:"concepts",slug:"/concepts/api-ui",permalink:"/concepts/api-ui",editUrl:"https://github.com/MTES-MCT/trackdechets/edit/dev/doc/docs/concepts/api-ui.md",version:"current",frontMatter:{title:"Lien entre l'API et l'interface web Trackd\xe9chets"},sidebar:"docs",previous:{title:"Limitations",permalink:"/reference/limitations"},next:{title:"Introduction \xe0 GraphQL",permalink:"/concepts/graphql"}},l=[],p={toc:l};function d(e){var t=e.components,n=(0,i.Z)(e,o);return(0,a.kt)("wrapper",(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"En plus de l'API Trackd\xe9chets, nous mettons \xe9galement \xe0 disposition ",(0,a.kt)("a",{parentName:"p",href:"https://app.trackdechets.beta.gouv.fr"},"une interface graphique")," qui permet plusieurs choses :"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"Cr\xe9ation de nouveaux utilisateurs"),(0,a.kt)("li",{parentName:"ul"},"Enregistrement d'\xe9tablissements et gestion des droits"),(0,a.kt)("li",{parentName:"ul"},"\xc9dition et suivi des bordereaux"),(0,a.kt)("li",{parentName:"ul"},"Export de registre")),(0,a.kt)("p",null,"L'interface graphique Trackd\xe9chets utilise la m\xeame API que l'API publique document\xe9e sur ce site \xe0 quelques exceptions pr\xe8s:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"L'acc\xe8s \xe0 certaines fonctionnalit\xe9s comme la cr\xe9ation de compte, la modification de mots de passe, la gestion des droits, etc, est restreinte \xe0 une utilisation via l'interface graphique Trackd\xe9chets uniquement."),(0,a.kt)("li",{parentName:"ul"},"\xc0 l'inverse, des fonctionnalit\xe9s avanc\xe9es de l'API peuvent ne pas \xeatre exploit\xe9es dans l'interface graphique.")),(0,a.kt)("div",{className:"admonition admonition-info alert alert--info"},(0,a.kt)("div",{parentName:"div",className:"admonition-heading"},(0,a.kt)("h5",{parentName:"div"},(0,a.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,a.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},(0,a.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"}))),"info")),(0,a.kt)("div",{parentName:"div",className:"admonition-content"},(0,a.kt)("p",{parentName:"div"},"L'interface graphique Trackd\xe9chets n'a pas vocation \xe0 se substituer \xe0 des solutions logicielles existantes mais plut\xf4t \xe0 fournir un point d'acc\xe8s basique pour la consultation et l'\xe9dition de bordereaux num\xe9riques. Elle permet notamemnt d'assurer l'acc\xe8s \xe0 la plateforme aux acteurs de la cha\xeene de tra\xe7abilit\xe9 qui ne sont pas \xe9quip\xe9s de solutions logicielles."))))}d.isMDXComponent=!0}}]);