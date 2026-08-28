export default function audioType (buf) {
	if (!buf) return;

	buf = new Uint8Array(buf.buffer || buf)

	if (isWav(buf)) return 'wav';
	if (isAiff(buf)) return 'aiff';
	if (isMp3(buf)) return 'mp3';
	if (isAac(buf)) return 'aac';
	if (isFlac(buf)) return 'flac';
	if (isTta(buf)) return 'tta';
	if (isM4a(buf)) return 'm4a';
	if (isOpus(buf)) return 'opus'; // overlaps with ogg, so must come first
	if (isOgg(buf)) return 'oga';
	if (isQoa(buf)) return 'qoa';
	if (isMidi(buf)) return 'mid';
	if (isCaf(buf)) return 'caf';
	if (isWma(buf)) return 'wma';
	if (isAmr(buf)) return 'amr';
	if (isWv(buf)) return 'wv';
	if (isMpc(buf)) return 'mpc';
	if (isApe(buf)) return 'ape';
	if (isDsf(buf)) return 'dsf';
	if (isDff(buf)) return 'dff';
	if (isEac3(buf)) return 'eac3'; // shares the 0x0B77 syncword with AC-3, disambiguated by bsid
	if (isAc3(buf)) return 'ac3';
	if (isDts(buf)) return 'dts';
	if (isIt(buf)) return 'it';
	if (isS3m(buf)) return 's3m';
	if (isXm(buf)) return 'xm';
	if (isMod(buf)) return 'mod';
	if (isMkv(buf)) return 'mkv';
	if (isWebm(buf)) return 'webm';
	if (isAvi(buf)) return 'avi';

	// mp3/flac/tta/aac may carry a leading ID3v2 tag (DSF's ID3 sits at the file's end, not the start,
	// so it never needs this). MP3 is confirmed only when a valid sync follows the tag — unless the
	// tag's declared size runs past the end of the buffer we were given, which is the common case when
	// audio-type is fed only the first few KB of a file: then mp3 is assumed, being the overwhelming
	// majority of ID3v2-tagged audio in the wild.
	let id3 = skipId3(buf);
	if (id3) {
		if (id3 >= buf.length) return 'mp3';
		let rest = buf.subarray(id3);
		if (isMp3(rest)) return 'mp3';
		if (isFlac(rest)) return 'flac';
		if (isTta(rest)) return 'tta';
		if (isAac(rest)) return 'aac';
	}
};

// ID3v2 header: 'ID3' + major/minor version + flags (bit 4 = footer present, ID3v2.4 only) +
// synchsafe size (4 bytes, 7 bits each, bytes 6-9) counting everything after this 10-byte header,
// excluding the footer. Returns the byte offset right after the tag (and footer, if any), or 0 if
// buf doesn't start with an ID3v2 tag. https://id3.org/id3v2.3.0#ID3v2_header
export function skipId3 (buf) {
	if (!buf || buf.length < 10) return 0
	if (buf[0] !== 0x49 || buf[1] !== 0x44 || buf[2] !== 0x33) return 0 // 'ID3'

	let size = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f)
	let footer = (buf[5] & 0x10) ? 10 : 0

	return 10 + size + footer
}

// MPEG sync (0xFF, layer bits != 0 — layer 00 is reserved/AAC ADTS, see isAac), or a legacy ID3v1 'TAG'
// trailer. Bare 'ID3' is NOT sufficient on its own: ID3v2 tags also prefix TTA, FLAC and AAC files —
// see the ID3-skip fallback in audioType() above, which is where that case is actually resolved.
export function isMp3 (buf) {
	if (!buf || buf.length < 3) return

	return (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0 && (buf[1] & 0x06) !== 0x00) || // MPEG sync, layer != 0 (excludes AAC)
		(buf[0] === 0x54 && buf[1] === 0x41 && buf[2] === 0x47) // TAG
};

export function isWav(buf) {
	if (!buf || buf.length < 12) return

	return buf[0] === 82 &&
		buf[1] === 73 &&
		buf[2] === 70 &&
		buf[3] === 70 &&
		buf[8] === 87 &&
		buf[9] === 65 &&
		buf[10] === 86 &&
		buf[11] === 69;
}

export function isOgg(buf) {
	if (!buf || buf.length < 4) return;

	return  buf[0] === 79 &&
		buf[1] === 103 &&
		buf[2] === 103 &&
		buf[3] === 83;
}

export function isFlac(buf) {
	if (!buf || buf.length < 4) return;

	return buf[0] === 102 &&
		buf[1] === 76 &&
		buf[2] === 97 &&
		buf[3] === 67;
}

export function isM4a(buf) {
	if (!buf || buf.length < 8) return;

	return (buf[4] === 102 &&
		buf[5] === 116 &&
		buf[6] === 121 &&
		buf[7] === 112) || (
			buf[0] === 77 &&
			buf[1] === 52 &&
			buf[2] === 65 &&
			buf[3] === 32
		);
}

export function isOpus(buf) {
	if (!buf || buf.length < 36) return

	// Bytes 0 to 3: detect general OGG (OPUS is OGG)
	// Bytes 28 to 35: detect OPUS
	return buf[0] === 79 &&
		buf[1] === 103 &&
		buf[2] === 103 &&
		buf[3] === 83 &&
		buf[28] === 79 &&
		buf[29] === 112 &&
		buf[30] === 117 &&
		buf[31] === 115 &&
		buf[32] === 72 &&
		buf[33] === 101 &&
		buf[34] === 97 &&
		buf[35] === 100;
}

export function isQoa(buf) {
	if (!buf || buf.length < 4) return
	return buf[0] === 0x71 && buf[1] === 0x6f && buf[2] === 0x61 && buf[3] === 0x66 // 'qoaf'
}

// 'FORM' + 'AIFF' or 'AIFC'
export function isAiff(buf) {
	if (!buf || buf.length < 12) return
	return buf[0] === 0x46 && buf[1] === 0x4f && buf[2] === 0x52 && buf[3] === 0x4d &&
		buf[8] === 0x41 && buf[9] === 0x49 && buf[10] === 0x46 && (buf[11] === 0x46 || buf[11] === 0x43)
}

// AAC ADTS: 0xFFF sync, layer = 00
export function isAac(buf) {
	if (!buf || buf.length < 2) return
	return buf[0] === 0xff && (buf[1] & 0xf0) === 0xf0 && (buf[1] & 0x06) === 0x00
}

// 'MThd'
export function isMidi(buf) {
	if (!buf || buf.length < 4) return
	return buf[0] === 0x4d && buf[1] === 0x54 && buf[2] === 0x68 && buf[3] === 0x64
}

// 'caff'
export function isCaf(buf) {
	if (!buf || buf.length < 4) return
	return buf[0] === 0x63 && buf[1] === 0x61 && buf[2] === 0x66 && buf[3] === 0x66
}

// ASF/WMA: ASF header GUID 30 26 B2 75 8E 66 CF 11
export function isWma(buf) {
	if (!buf || buf.length < 8) return
	return buf[0] === 0x30 && buf[1] === 0x26 && buf[2] === 0xb2 && buf[3] === 0x75 &&
		buf[4] === 0x8e && buf[5] === 0x66 && buf[6] === 0xcf && buf[7] === 0x11
}

// '#!AMR'
export function isAmr(buf) {
	if (!buf || buf.length < 5) return
	return buf[0] === 0x23 && buf[1] === 0x21 && buf[2] === 0x41 && buf[3] === 0x4d && buf[4] === 0x52
}

// EBML header (0x1A45DFA3) — could be webm or matroska
export function isWebm(buf) {
	if (!buf || buf.length < 4) return
	return buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3
}

// RIFF container with 'AVI ' form type
export function isAvi(buf) {
	if (!buf || buf.length < 12) return
	return buf[0] === 82 && buf[1] === 73 && buf[2] === 70 && buf[3] === 70 &&
		buf[8] === 65 && buf[9] === 86 && buf[10] === 73 && buf[11] === 32
}

// EBML header whose DocType is "matroska" (WebM declares "webm")
export function isMkv(buf) {
	if (!isWebm(buf)) return
	let n = Math.min(buf.length, 64)
	for (let i = 4; i < n - 8; i++)
		if (buf[i] === 0x42 && buf[i + 1] === 0x82) // DocType element id
			return buf[i + 3] === 109 && buf[i + 4] === 97 && buf[i + 5] === 116 && buf[i + 6] === 114 // "matr"
}

// AC-3 syncword 0x0B77 followed by a valid frame-size code and bsid ≤ 8 (bsid 9-10 reserved,
// 11-16 is E-AC-3 — see isEac3)
export function isAc3(buf) {
	if (!buf || buf.length < 6) return
	return buf[0] === 0x0B && buf[1] === 0x77 && (buf[4] & 0x3F) < 38 && (buf[5] >> 3) <= 8
}

// E-AC-3 (Dolby Digital Plus): same 0x0B77 syncword as AC-3, but bsid 11-16 (ETSI TS 102 366 Annex E;
// 16 is the common E-AC-3 bsid, 11-15 also fall in the standard's E-AC-3 range)
export function isEac3(buf) {
	if (!buf || buf.length < 6) return
	let bsid = buf[5] >> 3
	return buf[0] === 0x0B && buf[1] === 0x77 && bsid >= 11 && bsid <= 16
}

// DTS core syncword 0x7FFE8001 (14-bit and little-endian variants: 0x1FFFE800, 0xFE7F0180)
export function isDts(buf) {
	if (!buf || buf.length < 4) return
	return (buf[0] === 0x7F && buf[1] === 0xFE && buf[2] === 0x80 && buf[3] === 0x01) ||
		(buf[0] === 0xFE && buf[1] === 0x7F && buf[2] === 0x01 && buf[3] === 0x80) ||
		(buf[0] === 0x1F && buf[1] === 0xFF && buf[2] === 0xE8 && buf[3] === 0x00)
}

// 'wvpk' block header
export function isWv(buf) {
	if (!buf || buf.length < 4) return
	return buf[0] === 0x77 && buf[1] === 0x76 && buf[2] === 0x70 && buf[3] === 0x6b
}

// True Audio: 'TTA1' — may also appear after a leading ID3v2 tag, resolved in audioType()
export function isTta(buf) {
	if (!buf || buf.length < 4) return
	return buf[0] === 0x54 && buf[1] === 0x54 && buf[2] === 0x41 && buf[3] === 0x31
}

// Musepack: 'MP+' (SV7, stream-version nibble === 7) or 'MPCK' (SV8)
export function isMpc(buf) {
	if (!buf || buf.length < 4) return
	if (buf[0] === 0x4d && buf[1] === 0x50 && buf[2] === 0x2b && (buf[3] & 0x0f) === 7) return true // 'MP+', SV7
	return buf[0] === 0x4d && buf[1] === 0x50 && buf[2] === 0x43 && buf[3] === 0x4b // 'MPCK', SV8
}

// Monkey's Audio: 'MAC ' descriptor/header magic
export function isApe(buf) {
	if (!buf || buf.length < 4) return
	return buf[0] === 0x4d && buf[1] === 0x41 && buf[2] === 0x43 && buf[3] === 0x20
}

// Sony DSD Stream File: 'DSD ' chunk id. Its ID3v2 tag (if any) is pointed to from within this
// header and lives at the end of the file, not the start — unlike mp3/flac/tta.
export function isDsf(buf) {
	if (!buf || buf.length < 4) return
	return buf[0] === 0x44 && buf[1] === 0x53 && buf[2] === 0x44 && buf[3] === 0x20
}

// Philips DSDIFF: 'FRM8' (4 bytes) + chunk size (8 bytes, offset 4-11) + 'DSD ' form type at offset 12
export function isDff(buf) {
	if (!buf || buf.length < 16) return
	return buf[0] === 0x46 && buf[1] === 0x52 && buf[2] === 0x4d && buf[3] === 0x38 &&
		buf[12] === 0x44 && buf[13] === 0x53 && buf[14] === 0x44 && buf[15] === 0x20
}

// ProTracker & friends: 4-byte format tag at offset 1080 (after the 20-byte title + 31×30-byte
// sample headers + song-length/restart/pattern-order-table). See the Amiga MOD format spec.
const MOD_TAGS = new Set(['M.K.', 'M!K!', 'FLT4', 'FLT8', 'CD81', 'OKTA'])
export function isMod(buf) {
	if (!buf || buf.length < 1084) return
	let tag = String.fromCharCode(buf[1080], buf[1081], buf[1082], buf[1083])
	return MOD_TAGS.has(tag) || /^\dCHN$/.test(tag) || /^\d\dCH$/.test(tag) || /^TDZ\d$/.test(tag)
}

// 'Extended Module: '
export function isXm(buf) {
	if (!buf || buf.length < 17) return
	const tag = 'Extended Module: '
	for (let i = 0; i < 17; i++) if (buf[i] !== tag.charCodeAt(i)) return false
	return true
}

// Scream Tracker 3: 'SCRM' at offset 44
export function isS3m(buf) {
	if (!buf || buf.length < 48) return
	return buf[44] === 0x53 && buf[45] === 0x43 && buf[46] === 0x52 && buf[47] === 0x4d
}

// Impulse Tracker: 'IMPM'. OpenMPT's IT-derived .mptm format reuses the same magic and is
// indistinguishable from .it by magic bytes alone — it detects as 'it' here.
export function isIt(buf) {
	if (!buf || buf.length < 4) return
	return buf[0] === 0x49 && buf[1] === 0x4d && buf[2] === 0x50 && buf[3] === 0x4d
}
