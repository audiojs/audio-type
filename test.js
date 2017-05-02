'use strict';
var assert = require('assert');
var readChunk = require('read-chunk');
var audioType = require('./index');
var test = require('tape')

function check(filename) {
	return audioType(readChunk.sync(filename, 0, 12));
}

test('should detect audio type from Buffer', function (t) {
	assert.strictEqual(check('fixture.mp3'), 'mp3');
	assert.strictEqual(check('fixture.wav'), 'wav');
	assert.strictEqual(check('fixture.png'), false);
	t.end()
});
