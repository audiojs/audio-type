import readChunk from 'read-chunk';
import audioType from './audio-type.js';
import test from 'tape'

function check(filename) {
	return audioType(readChunk.sync(filename, 0, 64));
}

test('should detect audio type from Buffer', function (t) {
	t.equal(check('fixture.mp3'), 'mp3');
	t.equal(check('fixture.wav'), 'wav');
	t.equal(check('fixture.flac'), 'flac');
	t.equal(check('fixture.m4a'), 'm4a');
	t.equal(check('fixture.opus'), 'opus');
	t.equal(check('fixture.ogg'), 'oga');
	t.equal(check('fixture.qoa'), 'qoa');
	t.equal(check('fixture.aiff'), 'aiff');
	t.equal(check('fixture.aac'), 'aac');
	t.equal(check('fixture.mid'), 'mid');
	t.equal(check('fixture.caf'), 'caf');
	t.equal(check('fixture.wma'), 'wma');
	t.equal(check('fixture.amr'), 'amr');
	t.equal(check('fixture.webm'), 'webm');
	t.equal(check('fixture.png'), undefined);
	t.end()
});
