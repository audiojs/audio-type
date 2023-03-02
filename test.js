import assert from 'assert';
import readChunk from 'read-chunk';
import audioType from './audio-type.js';
import test from 'tape'

function check(filename) {
	return audioType(readChunk.sync(filename, 0, 12));
}

test('should detect audio type from Buffer', function (t) {
	assert.strictEqual(check('fixture.mp3'), 'mp3');
	assert.strictEqual(check('fixture.wav'), 'wav');
	assert.strictEqual(check('fixture.png'), undefined);
	t.end()
});
