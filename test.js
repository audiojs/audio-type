import readChunk from 'read-chunk';
import audioType, { isAc3, isEac3, isMpc, isMod, skipId3 } from './audio-type.js';
import test from 'tape'

function check(filename, len = 64) {
	return audioType(readChunk.sync(filename, 0, len));
}

function concat(...arrs) {
	let len = arrs.reduce((n, a) => n + a.length, 0), out = new Uint8Array(len), o = 0;
	for (let a of arrs) { out.set(a, o); o += a.length; }
	return out;
}

// ID3v2.3 header: 'ID3' + major(3) + minor(0) + flags + synchsafe size (7 bits/byte)
function id3Header(size, flags = 0) {
	let b = new Uint8Array(10);
	b[0] = 0x49; b[1] = 0x44; b[2] = 0x33;
	b[3] = 3; b[4] = 0; b[5] = flags;
	b[6] = (size >>> 21) & 0x7f;
	b[7] = (size >>> 14) & 0x7f;
	b[8] = (size >>> 7) & 0x7f;
	b[9] = size & 0x7f;
	return b;
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
	t.equal(check('fixture.avi'), 'avi');
	t.equal(check('fixture.mkv'), 'mkv');
	t.equal(check('fixture.ac3'), 'ac3');
	t.equal(check('fixture.dts'), 'dts');
	t.equal(check('fixture.png'), undefined);
	t.end()
});

test('video containers still win over the new formats (no accidental shadowing)', function (t) {
	// none of wv/tta/mpc/ape/dsf/dff/eac3/mod/xm/s3m/it share a magic prefix with RIFF/EBML/ISOBMFF,
	// so these must still resolve to their container type, not fall through to undefined or a new key
	t.equal(check('fixture.avi'), 'avi');
	t.equal(check('fixture.mkv'), 'mkv');
	t.equal(check('fixture.webm'), 'webm');
	t.equal(check('fixture.m4a'), 'm4a');
	t.end()
});

test('wv — WavPack: "wvpk" at 0', function (t) {
	t.equal(check('fixture.wv'), 'wv');
	t.notEqual(check('fixture.wav'), 'wv'); // RIFF/WAVE, not wvpk — must not collide
	t.equal(audioType(new Uint8Array([0x77, 0x76, 0x70])), undefined, 'needs all 4 magic bytes');
	t.end()
});

test('tta — True Audio: "TTA1" at 0', function (t) {
	t.equal(check('fixture.tta'), 'tta');
	t.equal(audioType(new Uint8Array([0x54, 0x54, 0x41, 0x32])), undefined, 'TTA2 tag is not TTA1');
	t.end()
});

test('mpc — Musepack: "MP+" (SV7) or "MPCK" (SV8)', function (t) {
	t.equal(check('fixture.mpc'), 'mpc', 'SV8 (MPCK)');
	t.equal(check('fixture-sv7.mpc'), 'mpc', 'SV7 (MP+), truncated fixture');
	t.ok(isMpc(new Uint8Array([0x4d, 0x50, 0x2b, 0x07])), 'SV7 low nibble 7 accepted directly');
	t.notOk(isMpc(new Uint8Array([0x4d, 0x50, 0x2b, 0x08])), 'SV7 low nibble != 7 rejected');
	t.notOk(isMpc(new Uint8Array([0x4d, 0x50, 0x4b, 0x4b])), '"MPKK" is not "MPCK"');
	t.end()
});

test('ape — Monkey\'s Audio: "MAC " at 0', function (t) {
	t.equal(check('fixture.ape'), 'ape');
	t.notEqual(check('fixture.mpc'), 'ape');
	t.end()
});

test('dsf/dff — DSD: "DSD " at 0, or "FRM8"+size+"DSD " at 12 (header-only fixtures)', function (t) {
	t.equal(check('fixture.dsf'), 'dsf');
	t.equal(check('fixture.dff'), 'dff');
	// DFF's form type sits at offset 12 (FRM8[4] + 8-byte size), not 8 — regression for that offset
	t.equal(audioType(concat(new TextEncoder().encode('FRM8'), new Uint8Array(8), new TextEncoder().encode('DSD '))), 'dff');
	t.equal(audioType(concat(new TextEncoder().encode('FRM8'), new Uint8Array(4), new TextEncoder().encode('DSD '), new Uint8Array(4))), undefined, '"DSD " at offset 8 (not 12) must NOT match');
	t.end()
});

test('eac3 — E-AC-3: 0x0B77 syncword, bsid 11-16 (AC-3 proper stays bsid <= 8)', function (t) {
	t.equal(check('fixture.eac3'), 'eac3');
	t.equal(check('fixture.ac3'), 'ac3', 'AC-3 fixture (bsid <= 8) must not be reclassified as eac3');

	let frame = (bsid) => new Uint8Array([0x0B, 0x77, 0, 0, 0, bsid << 3]);
	t.equal(isAc3(frame(8)), true); t.equal(isEac3(frame(8)), false);
	t.equal(isAc3(frame(9)), false); t.equal(isEac3(frame(9)), false, 'bsid 9-10 is reserved, neither AC-3 nor E-AC-3');
	t.equal(isAc3(frame(10)), false); t.equal(isEac3(frame(10)), false);
	t.equal(isAc3(frame(11)), false); t.equal(isEac3(frame(11)), true);
	t.equal(isAc3(frame(16)), false); t.equal(isEac3(frame(16)), true);
	t.equal(isAc3(frame(17)), false); t.equal(isEac3(frame(17)), false, 'bsid > 16 is neither');
	t.end()
});

test('mod family — ProTracker at offset 1080, XM/S3M/IT at their own fixed offsets', function (t) {
	t.equal(check('fixture.mod', 1084), 'mod', 'needs the first 1084 bytes, not just 64 — the tag sits past the sample header table');
	t.equal(check('fixture.mod'), undefined, 'a 64-byte probe is NOT enough for MOD (documented limitation)');
	t.equal(check('fixture.xm'), 'xm');
	t.equal(check('fixture.s3m'), 's3m');
	t.equal(check('fixture.it'), 'it', 'OpenMPT .mptm fixture — shares IMPM magic with .it, indistinguishable by magic bytes');

	t.ok(isMod(concat(new Uint8Array(1080), new TextEncoder().encode('10CH'))), '10CH..32CH pattern');
	t.ok(isMod(concat(new Uint8Array(1080), new TextEncoder().encode('TDZ4'))), 'TDZ\\d pattern');
	t.notOk(isMod(concat(new Uint8Array(1080), new TextEncoder().encode('XXXX'))), 'unrecognized tag rejected');
	t.end()
});

test('ID3v2-prefixed formats — isMp3 no longer trusts a bare "ID3" prefix (bug fix)', function (t) {
	// The old isMp3 returned true for ANY buffer starting with "ID3", regardless of what followed —
	// misdetecting ID3-tagged TTA/FLAC/AAC files as mp3. audioType() now skips the tag (skipId3) and
	// only trusts mp3 when a real MPEG sync follows, or when the tag runs past the probe buffer.

	// ID3 tag (declared size 4) + 4 bytes padding + real MPEG sync, all within the buffer: confirmed via sync
	let mp3Sync = new Uint8Array([0xff, 0xfb, 0x90, 0x00]);
	let confirmed = concat(id3Header(4), new Uint8Array(4), mp3Sync);
	t.equal(skipId3(confirmed), 14, 'tag ends right before the sync');
	t.ok(skipId3(confirmed) < confirmed.length, 'sync is within the buffer — this exercises the "confirmed" branch, not the fallback');
	t.equal(audioType(confirmed), 'mp3');

	// ID3 tag whose declared size runs past the end of the (short) probe buffer: fall back to mp3
	let oversized = id3Header(10000); // just the 10-byte header, no data — buffer ends mid-tag
	t.ok(skipId3(oversized) >= oversized.length, 'declared tag size exceeds what we were given');
	t.equal(audioType(oversized), 'mp3');

	// ID3 tag + 'fLaC' — FLAC files may carry a leading ID3v2 tag
	let flacMagic = new Uint8Array([0x66, 0x4c, 0x61, 0x43]);
	t.equal(audioType(concat(id3Header(0), flacMagic)), 'flac');

	// ID3 tag + AAC ADTS sync
	let aacSync = new Uint8Array([0xff, 0xf1, 0x50, 0x80]);
	t.equal(audioType(concat(id3Header(0), aacSync)), 'aac');

	// ID3 tag + 'TTA1' — real-world fixture (ID3v2.3 header + one TIT2 frame + TTA header)
	t.equal(check('fixture-id3.tta'), 'tta');

	// no tag at all
	t.equal(skipId3(new Uint8Array([0x66, 0x4c, 0x61, 0x43])), 0);
	t.equal(skipId3(new Uint8Array(9)), 0, 'buffer shorter than the 10-byte ID3 header');

	t.end()
});
