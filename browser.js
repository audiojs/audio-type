!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.audioType=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';
module.exports = function (buf) {
	if (!buf) {
		return false;
	}

	if (_dereq_('is-mp3')(buf)) {
		return 'mp3';
	}

	if (_dereq_('is-wav')(buf)) {
		return 'wav';
	}

	if (_dereq_('is-ogg')(buf)) {
		return 'oga';
	}

	if (_dereq_('is-flac')(buf)) {
		return 'flac';
	}

	return false;
};

},{"is-flac":2,"is-mp3":3,"is-ogg":4,"is-wav":5}],2:[function(_dereq_,module,exports){
'use strict';
module.exports = function (buf) {
	if (!buf || buf.length < 3) {
		return false;
	}

	return buf[0] === 102 &&
    buf[1] === 76 &&
    buf[2] === 97 &&
    buf[3] === 67 
};

},{}],3:[function(_dereq_,module,exports){
'use strict';
module.exports = function (buf) {
	if (!buf || buf.length < 3) {
		return false;
	}

	return (buf[0] === 73 &&
		buf[1] === 68 &&
		buf[2] === 51) || ( 
      buf[0] === 255 &&
      buf[1] === 251
    )
  
};

},{}],4:[function(_dereq_,module,exports){
'use strict';
module.exports = function (buf) {
	if (!buf || buf.length < 3) {
		return false;
	}

	return buf[0] === 79 &&
		buf[1] === 103 &&
		buf[2] === 103 &&
    buf[3] === 83
};

},{}],5:[function(_dereq_,module,exports){
'use strict';
module.exports = function (buf) {
	if (!buf || buf.length < 3) {
		return false;
	}

	return buf[0] === 82 &&
		buf[1] === 73 &&
		buf[2] === 70 &&
    buf[3] === 70 &&
    buf[8] === 87 &&
    buf[9] === 65 &&
    buf[10] === 86 &&
    buf[11] === 69
};

},{}]},{},[1])
(1)
});