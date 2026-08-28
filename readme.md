# audio-type [![test](https://github.com/audiojs/audio-type/actions/workflows/test.js.yml/badge.svg)](https://github.com/audiojs/audio-type/actions/workflows/test.js.yml) [![stable](https://img.shields.io/badge/stability-stable-brightgreen.svg)](http://github.com/badges/stability-badges) [![npm](https://img.shields.io/npm/v/audio-type.svg)](https://www.npmjs.com/package/audio-type) [![license](https://img.shields.io/npm/l/audio.svg)](https://www.npmjs.com/package/audio-type)

> Detect the audio type of a ArrayBuffer/Uint8Array

## Install

```sh
$ npm i audio-type
```

## Usage

##### Node.js

```js
import readChunk from 'read-chunk'; // npm install read-chunk
import audioType from 'audio-type';
var buffer = readChunk.sync('meow.wav', 0, 64);

audioType(buffer);
//=> wav
```

##### Browser

```js
import audioType from './audio-type.js'

var xhr = new XMLHttpRequest();
xhr.open('GET', 'meow.flac');
xhr.responseType = 'arraybuffer';

xhr.onload = function () {
	audioType(this.response);
	//=> flac
};

xhr.send();
```


## API

### audioType(buffer)

Returns one of the keys below, or `undefined` if the format isn't recognized.

| Key | Format | Magic | Offset |
| --- | --- | --- | --- |
| `wav` | WAVE | `RIFF`…`WAVE` | 0, 8 |
| `aiff` | AIFF/AIFC | `FORM`…`AIFF`/`AIFC` | 0, 8 |
| `mp3` | MPEG audio | MPEG sync (`0xFF Ex`) or `TAG` (ID3v1 trailer) | 0 |
| `aac` | AAC (ADTS) | `0xFFF` sync, layer 00 | 0 |
| `flac` | FLAC | `fLaC` | 0 |
| `tta` | True Audio | `TTA1` | 0 |
| `m4a` | MPEG-4 audio | `ftyp` or `M4A ` | 4 or 0 |
| `opus` | Opus (in Ogg) | `OggS`…`OpusHead` | 0, 28 |
| `oga` | Ogg | `OggS` | 0 |
| `qoa` | Quite OK Audio | `qoaf` | 0 |
| `mid` | MIDI | `MThd` | 0 |
| `caf` | Core Audio Format | `caff` | 0 |
| `wma` | ASF/WMA | ASF header GUID | 0 |
| `amr` | AMR | `#!AMR` | 0 |
| `wv` | WavPack | `wvpk` | 0 |
| `mpc` | Musepack | `MP+` (SV7) or `MPCK` (SV8) | 0 |
| `ape` | Monkey's Audio | `MAC ` | 0 |
| `dsf` | DSD Stream File | `DSD ` | 0 |
| `dff` | DSDIFF | `FRM8`…`DSD ` | 0, 12 |
| `eac3` | E-AC-3 (Dolby Digital Plus) | `0x0B77` sync, bsid 11–16 | 0 |
| `ac3` | AC-3 (Dolby Digital) | `0x0B77` sync, bsid ≤ 8 | 0 |
| `dts` | DTS | `0x7FFE8001` (or its bit-reordered variants) | 0 |
| `it` | Impulse Tracker | `IMPM` | 0 |
| `s3m` | Scream Tracker 3 | `SCRM` | 44 |
| `xm` | Extended Module | `Extended Module: ` | 0 |
| `mod` | ProTracker & friends | `M.K.`, `M!K!`, `xCHN`, `xxCH`, `FLTx`, `TDZx`, `CD81`, `OKTA` | 1080 |
| `mkv` | Matroska | EBML header, DocType `matroska` | 0 |
| `webm` | WebM | EBML header, DocType `webm` | 0 |
| `avi` | AVI | `RIFF`…`AVI ` | 0, 8 |

Note: OpenMPT's `.mptm` format is IT-derived and reuses the `IMPM` magic verbatim — it is indistinguishable from `.it` by magic bytes alone and also detects as `it`.

#### buffer

Type: `buffer` *(Node.js)*, `arrayBuffer`, `uint8array`

The first 64 bytes are enough for every format except `mod`, whose tag sits at offset 1080 (past the sample header table) — pass at least the first 1084 bytes if you need to detect trackers.

#### ID3v2 tags

`mp3`, `flac`, `tta` and `aac` files may carry a leading ID3v2 tag. `audioType()` skips it and inspects what follows: `mp3` is only returned once a real MPEG sync is found after the tag — unless the tag's declared size runs past the end of the buffer you gave it, in which case `mp3` is assumed (the overwhelming majority of ID3v2-tagged audio in the wild is MP3, and a truncated probe buffer — the common case — can't prove otherwise). `dsf`'s optional ID3v2 tag lives at the *end* of the file, not the start, so it never enters into this.

## License

MIT • <a href="https://github.com/krishnized/license/">ॐ</a>

