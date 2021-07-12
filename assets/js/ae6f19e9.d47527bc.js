(self.webpackChunktd_doc=self.webpackChunktd_doc||[]).push([[2932],{3905:function(e,r,t){"use strict";t.d(r,{Zo:function(){return d},kt:function(){return f}});var n=t(67294);function l(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function s(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function a(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?s(Object(t),!0).forEach((function(r){l(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):s(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function i(e,r){if(null==e)return{};var t,n,l=function(e,r){if(null==e)return{};var t,n,l={},s=Object.keys(e);for(n=0;n<s.length;n++)t=s[n],r.indexOf(t)>=0||(l[t]=e[t]);return l}(e,r);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(n=0;n<s.length;n++)t=s[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(l[t]=e[t])}return l}var u=n.createContext({}),o=function(e){var r=n.useContext(u),t=r;return e&&(t="function"==typeof e?e(r):a(a({},r),e)),t},d=function(e){var r=o(e.components);return n.createElement(u.Provider,{value:r},e.children)},c={inlineCode:"code",wrapper:function(e){var r=e.children;return n.createElement(n.Fragment,{},r)}},p=n.forwardRef((function(e,r){var t=e.components,l=e.mdxType,s=e.originalType,u=e.parentName,d=i(e,["components","mdxType","originalType","parentName"]),p=o(t),f=l,k=p["".concat(u,".").concat(f)]||p[f]||c[f]||s;return t?n.createElement(k,a(a({ref:r},d),{},{components:t})):n.createElement(k,a({ref:r},d))}));function f(e,r){var t=arguments,l=r&&r.mdxType;if("string"==typeof e||l){var s=t.length,a=new Array(s);a[0]=p;var i={};for(var u in r)hasOwnProperty.call(r,u)&&(i[u]=r[u]);i.originalType=e,i.mdxType="string"==typeof e?e:l,a[1]=i;for(var o=2;o<s;o++)a[o]=t[o];return n.createElement.apply(null,a)}return n.createElement.apply(null,t)}p.displayName="MDXCreateElement"},61339:function(e,r,t){"use strict";t.r(r),t.d(r,{frontMatter:function(){return i},contentTitle:function(){return u},metadata:function(){return o},toc:function(){return d},default:function(){return p}});var n=t(22122),l=t(19756),s=(t(67294),t(3905)),a=["components"],i={id:"queries",title:"Queries",slug:"queries"},u=void 0,o={unversionedId:"reference/api-reference/bsdasri/queries",id:"reference/api-reference/bsdasri/queries",isDocsHomePage:!1,title:"Queries",description:"bsdasri",source:"@site/docs/reference/api-reference/bsdasri/queries.md",sourceDirName:"reference/api-reference/bsdasri",slug:"/reference/api-reference/bsdasri/queries",permalink:"/reference/api-reference/bsdasri/queries",editUrl:"https://github.com/MTES-MCT/trackdechets/edit/dev/doc/docs/reference/api-reference/bsdasri/queries.md",version:"current",frontMatter:{id:"queries",title:"Queries",slug:"queries"},sidebar:"docs",previous:{title:"Scalars",permalink:"/reference/api-reference/bsdd/scalars"},next:{title:"Mutations",permalink:"/reference/api-reference/bsdasri/mutations"}},d=[{value:"bsdasri",id:"bsdasri",children:[]},{value:"bsdasriPdf",id:"bsdasripdf",children:[]},{value:"bsdasris",id:"bsdasris",children:[]}],c={toc:d};function p(e){var r=e.components,t=(0,l.Z)(e,a);return(0,s.kt)("wrapper",(0,n.Z)({},c,t,{components:r,mdxType:"MDXLayout"}),(0,s.kt)("h2",{id:"bsdasri"},"bsdasri"),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},"Type:")," ",(0,s.kt)("a",{parentName:"p",href:"/reference/api-reference/bsdasri/objects#bsdasri"},"Bsdasri!")),(0,s.kt)("p",null,"EXPERIMENTAL - Ne pas utiliser dans un contexte de production"),(0,s.kt)("p",{style:{marginBottom:"0.4em"}},(0,s.kt)("strong",null,"Arguments")),(0,s.kt)("table",null,(0,s.kt)("thead",null,(0,s.kt)("tr",null,(0,s.kt)("th",null,"Name"),(0,s.kt)("th",null,"Description"))),(0,s.kt)("tbody",null,(0,s.kt)("tr",null,(0,s.kt)("td",null,"id",(0,s.kt)("br",null),(0,s.kt)("a",{href:"/reference/api-reference/bsdasri/scalars#id"},(0,s.kt)("code",null,"ID!"))),(0,s.kt)("td",null,(0,s.kt)("p",null,"Identifiant du BSD"))))),(0,s.kt)("h2",{id:"bsdasripdf"},"bsdasriPdf"),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},"Type:")," ",(0,s.kt)("a",{parentName:"p",href:"/reference/api-reference/bsdasri/objects#filedownload"},"FileDownload!")),(0,s.kt)("p",null,"Renvoie un token pour t\xe9l\xe9charger un pdf de bordereau\nCe token doit \xeatre transmis \xe0 la route /download pour obtenir le fichier.\nIl est valable 10 secondes"),(0,s.kt)("p",{style:{marginBottom:"0.4em"}},(0,s.kt)("strong",null,"Arguments")),(0,s.kt)("table",null,(0,s.kt)("thead",null,(0,s.kt)("tr",null,(0,s.kt)("th",null,"Name"),(0,s.kt)("th",null,"Description"))),(0,s.kt)("tbody",null,(0,s.kt)("tr",null,(0,s.kt)("td",null,"id",(0,s.kt)("br",null),(0,s.kt)("a",{href:"/reference/api-reference/bsdasri/scalars#id"},(0,s.kt)("code",null,"ID"))),(0,s.kt)("td",null,(0,s.kt)("p",null,"ID d'un bordereau"))))),(0,s.kt)("h2",{id:"bsdasris"},"bsdasris"),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},"Type:")," ",(0,s.kt)("a",{parentName:"p",href:"/reference/api-reference/bsdasri/objects#bsdasriconnection"},"BsdasriConnection!")),(0,s.kt)("p",null,"EXPERIMENTAL - Ne pas utiliser dans un contexte de production\nRenvoie les Bsdasris.\nPar d\xe9faut, les dasris des diff\xe9rentes companies de l'utilisateur sont renvoy\xe9s."),(0,s.kt)("p",{style:{marginBottom:"0.4em"}},(0,s.kt)("strong",null,"Arguments")),(0,s.kt)("table",null,(0,s.kt)("thead",null,(0,s.kt)("tr",null,(0,s.kt)("th",null,"Name"),(0,s.kt)("th",null,"Description"))),(0,s.kt)("tbody",null,(0,s.kt)("tr",null,(0,s.kt)("td",null,"after",(0,s.kt)("br",null),(0,s.kt)("a",{href:"/reference/api-reference/bsdasri/scalars#id"},(0,s.kt)("code",null,"ID"))),(0,s.kt)("td",null,(0,s.kt)("p",null,"(Optionnel) PAGINATION Permet en conjonction avec ",(0,s.kt)("code",null,"first"),' de paginer "en avant" (des Bsdasri les plus r\xe9cents aux Bsdasri les plus anciens) Curseur apr\xe8s lequel les Bsdasri doivent \xeatre retourn\xe9s Attend un identifiant (propri\xe9t\xe9 ',(0,s.kt)("code",null,"id"),") de BSD D\xe9faut \xe0 vide, pour retourner les Bsdasri les plus r\xe9cents. Le BSD pr\xe9cis\xe9 dans le curseur ne fait pas partie du r\xe9sultat"))),(0,s.kt)("tr",null,(0,s.kt)("td",null,"first",(0,s.kt)("br",null),(0,s.kt)("a",{href:"/reference/api-reference/bsdasri/scalars#int"},(0,s.kt)("code",null,"Int"))),(0,s.kt)("td",null,(0,s.kt)("p",null,"(Optionnel) PAGINATION Permet en conjonction avec ",(0,s.kt)("code",null,"after"),' de paginer "en avant" (des Bsdasri les plus r\xe9cents aux Bsdasri les plus anciens) Nombre de Bsdasri retourn\xe9s apr\xe8s le ',(0,s.kt)("code",null,"cursorAfter"),"D\xe9faut \xe0 50, maximum \xe0 500"))),(0,s.kt)("tr",null,(0,s.kt)("td",null,"before",(0,s.kt)("br",null),(0,s.kt)("a",{href:"/reference/api-reference/bsdasri/scalars#id"},(0,s.kt)("code",null,"ID"))),(0,s.kt)("td",null,(0,s.kt)("p",null,"(Optionnel) PAGINATION Permet en conjonction avec ",(0,s.kt)("code",null,"last"),' de paginer "en arri\xe8re" (des Bsdasri les plus anciens aux Bsdasris les plus r\xe9cents) Curseur avant lequel les Bsdasri doivent \xeatre retourn\xe9s Attend un identifiant (propri\xe9t\xe9 ',(0,s.kt)("code",null,"id"),") de BSD D\xe9faut \xe0 vide, pour retourner les Bsdasri les plus anciens Le BSD pr\xe9cis\xe9 dans le curseur ne fait pas partie du r\xe9sultat"))),(0,s.kt)("tr",null,(0,s.kt)("td",null,"last",(0,s.kt)("br",null),(0,s.kt)("a",{href:"/reference/api-reference/bsdasri/scalars#int"},(0,s.kt)("code",null,"Int"))),(0,s.kt)("td",null,(0,s.kt)("p",null,"(Optionnel) PAGINATION Nombre de Bsdasri retourn\xe9s avant le ",(0,s.kt)("code",null,"before"),"D\xe9faut \xe0 50, maximum \xe0 500"))),(0,s.kt)("tr",null,(0,s.kt)("td",null,"where",(0,s.kt)("br",null),(0,s.kt)("a",{href:"/reference/api-reference/bsdasri/inputObjects#bsdasriwhere"},(0,s.kt)("code",null,"BsdasriWhere"))),(0,s.kt)("td",null,(0,s.kt)("p",null,"Filtres de recherche"))))))}p.isMDXComponent=!0}}]);