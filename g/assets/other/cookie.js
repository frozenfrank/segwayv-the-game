/*!
 * JavaScript Cookie v2.1.1
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
(function(k){if("function"===typeof define&&define.amd)define(k);else if("object"===typeof exports)module.exports=k();else{var g=window.Cookies,c=window.Cookies=k();c.noConflict=function(){window.Cookies=g;return c}}})(function(){function k(){for(var c=0,b={};c<arguments.length;c++){var a=arguments[c],f;for(f in a)b[f]=a[f]}return b}function g(c){function b(a,f,e){var h;if("undefined"!==typeof document){if(1<arguments.length){e=k({path:"/"},b.defaults,e);if("number"===typeof e.expires){var l=new Date;
l.setMilliseconds(l.getMilliseconds()+864E5*e.expires);e.expires=l}try{h=JSON.stringify(f),/^[\{\[]/.test(h)&&(f=h)}catch(g){}f=c.write?c.write(f,a):encodeURIComponent(String(f)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent);a=encodeURIComponent(String(a));a=a.replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent);a=a.replace(/[\(\)]/g,escape);return document.cookie=[a,"=",f,e.expires&&"; expires="+e.expires.toUTCString(),e.path&&"; path="+e.path,e.domain&&
"; domain="+e.domain,e.secure?"; secure":""].join("")}a||(h={});for(var l=document.cookie?document.cookie.split("; "):[],p=/(%[0-9A-Z]{2})+/g,n=0;n<l.length;n++){var d=l[n].split("="),m=d[0].replace(p,decodeURIComponent),d=d.slice(1).join("=");'"'===d.charAt(0)&&(d=d.slice(1,-1));try{d=c.read?c.read(d,m):c(d,m)||d.replace(p,decodeURIComponent);if(this.json)try{d=JSON.parse(d)}catch(g){}if(a===m){h=d;break}a||(h[m]=d)}catch(g){}}return h}}b.set=b;b.get=function(a){return b(a)};b.getJSON=function(){return b.apply({json:!0},
[].slice.call(arguments))};b.defaults={};b.remove=function(a,c){b(a,"",k(c,{expires:-1}))};b.withConverter=g;return b}return g(function(){})});