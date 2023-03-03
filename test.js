import readChunk from 'read-chunk';
import audioType from './audio-type.js';
import test from 'tape'

function check(filename) {
	return audioType(readChunk.sync(filename, 0, 12));
}

test('should detect audio type from Buffer', function (t) {
	t.equal(check('fixture.mp3'), 'mp3');
	t.equal(check('fixture.wav'), 'wav');
	t.equal(check('fixture.png'), undefined);
	t.end()
});
