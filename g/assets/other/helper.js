var $,Image;
Array.prototype.move = function (oldIndex, newIndex) {
	//http://stackoverflow.com/a/5306832
	while (oldIndex < 0) {
		oldIndex += this.length;
	}
	while (newIndex < 0) {
		newIndex += this.length;
	}
	if (newIndex >= this.length) {
		var k = newIndex - this.length;
		while ((k--) + 1) {
			this.push(undefined);
		}
	}
	this.splice(newIndex, 0, this.splice(oldIndex, 1)[0]);
}
Array.prototype.toPolar = function(format){
    // [x,y]
    var radius = Math.sqrt(Math.pow(this[0],2) + Math.pow(this[1],2)),
        theta = Math.atan(this[1] / this[0]);

    if(format === 'object')
        return {
            radius: radius,
            theta: theta,
        };
    else
        return [radius, theta];
};
Array.prototype.toCartesian = function(format){
    // [radius, theta (radians)]
    var x = this[0] * Math.cos(this[1]),
        y = this[0] * Math.sin(this[1]);
        //x = r * cos( theta ), y = r * sin( theta )

    if(format === 'object')
        return {
            x: x,
            y: y,
        };
    else
        return [x, y];
};
Number.prototype.toRadians = function(){
	return this * Math.PI / 180;
}
Number.prototype.toDegrees = function(){
	return this * 180 / Math.PI;
}
Number.prototype.min = function(minValue){
    if(this < minValue) return minValue;
    return this;
}
Number.prototype.max = function(maxValue){
    if(this > maxValue) return maxValue;
    return this;
}
Number.prototype.roundTo = function(multiple){
	if(!multiple)
		multiple = 1;

	return Math.round(this / multiple) * multiple;
};
Number.prototype.cleanAngle = function(inRadians){
    var n = this,
        base = 360;
    if(inRadians) base = 2 * Math.PI();

    n %= base;
    if(n < 0) n += base;
    n %= base;

    return n;
    //always returns a number that fits: 0 <= n < base
};
Number.prototype.steeringAngle = function(){
    var a = this.cleanAngle();
    if(a > 180) return a - 360;
    else        return a;
};
String.prototype.upperFirst = function() {
    //make the first letter uppercase
    //on the chopping block
    console.log("called a function that is on the chopping block");
    return this.charAt(0).toUpperCase() + this.slice(1);
}
CanvasRenderingContext2D.prototype.setFontSize = function(size) {
    var font = this.font.split(" ");
    font = font[font.length-1];
    this.font = size + " " + font;
}
Object.byString = function(objectToRead, stringReference) {
    //http://stackoverflow.com/a/6491621/2844859
    //usage: Object.byString(objectToRead, 'part3[0].name');
    var o = objectToRead, s = stringReference;
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}
function rotatePoint(x,y,theta,centerX,centerY){
	var a = {
		x:arguments[0], //the point to rotate
		y:arguments[1],
		theta:arguments[2], //in radians
		centerX:arguments[3] || 0, // to point to rotate around
		centerY:arguments[4] || 0,
	};
	return {
		x: a.x * Math.cos(a.theta) - a.y * Math.sin(a.theta) + a.centerX,
		y: a.x * Math.sin(a.theta) + a.y * Math.cos(a.theta) + a.centerY,
	};
}
function getStandardAngle(x1,y1,x2,y2){
	//return the angle formed between (y = x1) and the point (x2,y2)
	x2 = x2 || 0;
	y2 = y2 || 0;
	return Math.atan2(y1 - y2, x1 - x2).toDegrees().cleanAngle();
}
function getDistance(x1,y1,x2,y2){
    /*
	if(!x2 && !y2 && Array.isArray(x1) && Array.isArray(y1)){
		var p1 = x1,
			p2 = y1;
			//support for passing in two arrays of points as [x,y] for the two sets
		x1 = p1[0];
		y1 = p1[1];
		x2 = p2[0];
		y2 = p2[1];
	}
	*/

	return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}
function rand(min,max){
    //returns an integer
	return Math.floor(Math.random()*(max-min))+min;
}
function forEach(obj,funct,extra1,extra2){
    //on the chopping block
    console.log("called forEach");
	for (var i in obj) {
		// skip loop if the property is from prototype
		if (!obj.hasOwnProperty(i)) continue;

		funct(obj[i],extra1,extra2);
	}
}
function randomHexCode(){
    //im not using this anymore
    console.log("called randomHexCode");
	return "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
}
function getFileExtension(fname){
    if(fname.indexOf("?") !== -1)
        fname = fname.substr(0,fname.indexOf("?")); //take off any js flags
    if(fname)
        return fname.substr((~-fname.lastIndexOf(".") >>> 0) + 2);
	console.warn("No file name provided");
}
var loadFile = (function(filename,logFile){
    var filesLoaded = 0,img = new Image();

    return function(){
        var fileref,
            filename = arguments[0],
            filetype = getFileExtension(filename).toLowerCase();

        switch (filetype) {
            case '':
                return;
            case 'js':
            case 'json':
                fileref=document.createElement('script');
                fileref.setAttribute("type","text/javascript");
                fileref.setAttribute("src", filename);
                break;
            case "css":
                fileref=document.createElement("link");
                fileref.setAttribute("rel", "stylesheet");
                fileref.setAttribute("type", "text/css");
                fileref.setAttribute("href", filename);
                break;
            case "jpg":
            case "jpeg":
            case 'png':
            case 'gif':
                img.src = filename;
                break;
            default:
                console.warn("This file type is not supported: "+filetype);
                return;
        }
        if (typeof fileref !== undefined){
            $("head").append(fileref);
            if(logFile)
                console.log('Loaded file: ' + filename);
        }
        filesLoaded++;
    }
})();
function hexAverage() {
	//from: http://stackoverflow.com/a/23851999
    //on the chopping block
    console.log("called a function that is on the chopping block");

	var args = Array.prototype.slice.call(arguments);
	function padToTwo(numberString) {
		if (numberString.length < 2) {
			numberString = '0' + numberString;
		}
		return numberString;
	}
	return args.reduce(function (previousValue, currentValue) {
		return currentValue
			.replace(/^#/, '')
			.match(/.{2}/g)
			.map(function (value, index) {
				return previousValue[index] + parseInt(value, 16);
			});
	}, [0, 0, 0])
	.reduce(function (previousValue, currentValue) {
		return previousValue + padToTwo(Math.floor(currentValue / args.length).toString(16));
	}, '#');
}
function arrayifyArguments(a){
	var args = [];
	for(var i = 0; i < a.length; i++)
		args.push(a[i]);

	return args;
}
function updateSome(){
	var y = arrayifyArguments(arguments);

	y.splice(0,0,true); //add true to the begginning to indicate deep
	return jQuery.extend.apply({}, y);
	//http://stackoverflow.com/a/9455045/2844859
}
/**
 * Fancy ID generator that creates 20-character string identifiers with the following properties:
 *
 * 1. They're based on timestamp so that they sort *after* any existing ids.
 * 2. They contain 72-bits of random data after the timestamp so that IDs won't collide with other clients' IDs.
 * 3. They sort *lexicographically* (so the timestamp is converted to characters that will sort properly).
 * 4. They're monotonically increasing.  Even if you generate more than one in the same timestamp, the
 *    latter ones will sort after the former ones.  We do this by using the previous random bits
 *    but "incrementing" them by 1 (only in the case of a timestamp collision).
 */
var generatePushID = (function() {
  // Modeled after base64 web-safe chars, but ordered by ASCII.
  var PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';

  // Timestamp of last push, used to prevent local collisions if you push twice in one ms.
  var lastPushTime = 0;

  // We generate 72-bits of randomness which get turned into 12 characters and appended to the
  // timestamp to prevent collisions with other clients.  We store the last characters we
  // generated because in the event of a collision, we'll use those same characters except
  // "incremented" by one.
  var lastRandChars = [];

  return function() {
    var now = new Date().getTime();
    var duplicateTime = (now === lastPushTime);
    lastPushTime = now;

    var timeStampChars = new Array(8);
    for (var i = 7; i >= 0; i--) {
      timeStampChars[i] = PUSH_CHARS.charAt(now % 64);
      // NOTE: Can't use << here because javascript will convert to int and lose the upper bits.
      now = Math.floor(now / 64);
    }
    if (now !== 0) throw new Error('We should have converted the entire timestamp.');

    var id = timeStampChars.join('');

    if (!duplicateTime) {
      for (i = 0; i < 12; i++) {
        lastRandChars[i] = Math.floor(Math.random() * 64);
      }
    } else {
      // If the timestamp hasn't changed since last push, use the same random number, except incremented by 1.
      for (i = 11; i >= 0 && lastRandChars[i] === 63; i--) {
        lastRandChars[i] = 0;
      }
      lastRandChars[i]++;
    }
    for (i = 0; i < 12; i++) {
      id += PUSH_CHARS.charAt(lastRandChars[i]);
    }
    if(id.length != 20) throw new Error('Length should be 20.');

    return id;
  };
})();
/*!
 * hoverIntent v1.8.0 // 2014.06.29 // jQuery v1.9.1+
 * http://cherne.net/brian/resources/jquery.hoverIntent.html
 *
 * You may use hoverIntent under the terms of the MIT license. Basically that
 * means you are free to use hoverIntent as long as this header is left intact.
 * Copyright 2007, 2014 Brian Cherne
 */

//(function($){$.fn.hoverIntent=function(handlerIn,handlerOut,selector){var cfg={interval:100,sensitivity:6,timeout:0};if(typeof handlerIn==="object"){cfg=$.extend(cfg,handlerIn)}else{if($.isFunction(handlerOut)){cfg=$.extend(cfg,{over:handlerIn,out:handlerOut,selector:selector})}else{cfg=$.extend(cfg,{over:handlerIn,out:handlerIn,selector:handlerOut})}}var cX,cY,pX,pY;var track=function(ev){cX=ev.pageX;cY=ev.pageY};var compare=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);if(Math.sqrt((pX-cX)*(pX-cX)+(pY-cY)*(pY-cY))<cfg.sensitivity){$(ob).off("mousemove.hoverIntent",track);ob.hoverIntent_s=true;return cfg.over.apply(ob,[ev])}else{pX=cX;pY=cY;ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}};var delay=function(ev,ob){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t);ob.hoverIntent_s=false;return cfg.out.apply(ob,[ev])};var handleHover=function(e){var ev=$.extend({},e);var ob=this;if(ob.hoverIntent_t){ob.hoverIntent_t=clearTimeout(ob.hoverIntent_t)}if(e.type==="mouseenter"){pX=ev.pageX;pY=ev.pageY;$(ob).on("mousemove.hoverIntent",track);if(!ob.hoverIntent_s){ob.hoverIntent_t=setTimeout(function(){compare(ev,ob)},cfg.interval)}}else{$(ob).off("mousemove.hoverIntent",track);if(ob.hoverIntent_s){ob.hoverIntent_t=setTimeout(function(){delay(ev,ob)},cfg.timeout)}}};return this.on({"mouseenter.hoverIntent":handleHover,"mouseleave.hoverIntent":handleHover},cfg.selector)}})(jQuery);
/**
 * Helper function to determine whether there is an intersection between the two polygons described
 * by the lists of vertices. Uses the Separating Axis Theorem
 *
 * @param a an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @param b an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @return true if there is any intersection between the 2 polygons, false otherwise
 */
function doPolygonsIntersect (a, b) {
    //http://stackoverflow.com/a/12414951/2844859
    var polygons = [a, b];
    var minA, maxA, projected, i, i1, j, minB, maxB;

    for (i = 0; i < polygons.length; i++) {

        // for each polygon, look at each edge of the polygon, and determine if it separates
        // the two shapes
        var polygon = polygons[i];
        for (i1 = 0; i1 < polygon.length; i1++) {

            // grab 2 vertices to create an edge
            var i2 = (i1 + 1) % polygon.length;
            var p1 = polygon[i1];
            var p2 = polygon[i2];

            // find the line perpendicular to this edge
            var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

            minA = maxA = undefined;
            // for each vertex in the first shape, project it onto the line perpendicular to the edge
            // and keep track of the min and max of these values
            for (j = 0; j < a.length; j++) {
                projected = normal.x * a[j].x + normal.y * a[j].y;
                if (!minA || projected < minA)
                    minA = projected;
                if (!maxA || projected > maxA)
                    maxA = projected;
            }

            // for each vertex in the second shape, project it onto the line perpendicular to the edge
            // and keep track of the min and max of these values
            minB = maxB = undefined;
            for (j = 0; j < b.length; j++) {
                projected = normal.x * b[j].x + normal.y * b[j].y;
                if (!minB || projected < minB)
                    minB = projected;
                if (!maxB || projected > maxB)
                    maxB = projected;
            }

            // if there is no overlap between the projects, the edge we are looking at separates the two
            // polygons, and we know there is no overlap
            if (maxA < minB || maxB < minA)
                return false;
        }
    }
    return true;
};
Array.prototype.toPolygonPathForm = function(center,scalar,rotation){
    //use this for the function above this!
    var points = [];
    if(!center) center = [0,0];
    if(!scalar) scalar = 1;
    if(!rotation) rotation = 0;

    for(var i=0;i<this.length;i++)
        points[i] = rotatePoint(this[i][0] * scalar,this[i][1] * scalar,rotation,center[0],center[1]);

    return points;
};
function clone(obj,type){
    //http://stackoverflow.com/a/728694
    //on the chopping block
    console.log("called a function that is on the chopping block");

    if(!type) type = 3;

    switch(type){
        case 1:
            return JSON.parse(JSON.stringify(a));
            break;
        case 2:
            return jQuery.extend(true, {}, obj);
            break;
        case 3:
            var copy;

            // Handle the 3 simple types, and null or undefined
            if (null == obj || "object" != typeof obj) return obj;

            // Handle Date
            if (obj instanceof Date) {
                copy = new Date();
                copy.setTime(obj.getTime());
                return copy;
            }

            // Handle Array
            if (obj instanceof Array) {
                copy = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    copy[i] = clone(obj[i]);
                }
                return copy;
            }

            // Handle Object
            if (obj instanceof Object) {
                copy = {};
                for (var attr in obj) {
                    if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
                }
                return copy;
            }

            throw new Error("Unable to copy obj! Its type isn't supported.");
        default:
            console.warn("Something bad happened");
    }
}
function clone(item) {
    if (!item) { return item; } // null, undefined values check

    var types = [ Number, String, Boolean ],
        result;

    // normalizing primitives if someone did new String('aaa'), or new Number('444');
    types.forEach(function(type) {
        if (item instanceof type) {
            result = type( item );
        }
    });

    if (typeof result == "undefined") {
        if (Object.prototype.toString.call( item ) === "[object Array]") {
            result = [];
            item.forEach(function(child, index, array) {
                result[index] = clone( child );
            });
        } else if (typeof item == "object") {
            // testing that this is DOM
            if (item.nodeType && typeof item.cloneNode == "function") {
                var result = item.cloneNode( true );
            } else if (!item.prototype) { // check that this is a literal
                if (item instanceof Date) {
                    result = new Date(item);
                } else {
                    // it is an object literal
                    result = {};
                    for (var i in item) {
                        result[i] = clone( item[i] ); //James: I found the recusion!
                    }
                }
            } else {
                // depending what you would like here,
                // just keep the reference, or create new object
                if (false && item.constructor) {
                    // would not advice to do that, reason? Read below
                    result = new item.constructor();
                } else {
                    result = item;
                }
            }
        } else {
            result = item;
        }
    }
    return result;
}
/** Function count the occurrences of substring in a string;
 * @param {String} string   Required. The string;
 * @param {String} subString    Required. The string to search for;
 * @param {Boolean} allowOverlapping    Optional. Default: false;
 * @author Vitim.us http://stackoverflow.com/a/7924240/2844859
 */
function occurrences(string, subString, allowOverlapping) {
    //on the chopping block
    console.log("called a function that is on the chopping block");

    string += "";
    subString += "";
    if (subString.length <= 0) return (string.length + 1);

    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length;

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}
function scrollTo(elementID,duration){
    $('html, body').animate({
        scrollTop: $("#" + elementID).offset().top
    }, duration || 2000);
}