# audio-type [![Build Status](https://travis-ci.org/audiojs/audio-type.svg?branch=master)](https://travis-ci.org/audiojs/audio-type) [![stable](https://img.shields.io/badge/stability-stable-brightgreen.svg)](http://github.com/badges/stability-badges) [![Greenkeeper badge](https://badges.greenkeeper.io/audiojs/audio-type.svg)](https://greenkeeper.io/) [![npm](https://img.shields.io/npm/v/audio-type.svg)](https://www.npmjs.com/package/audio-type) [![license](https://img.shields.io/npm/l/audio.svg)](https://www.npmjs.com/package/audio-type)

> Detect the audio type of a Buffer/Uint8Array

## Install

```sh
$ npm install --save audio-type
```

```sh
$ bower install --save audio-type
```

```sh
$ component install audiojs/audio-type
```


## Usage

##### Node.js

```js
var readChunk = require('read-chunk'); // npm install read-chunk
var audioType = require('audio-type');
var buffer = readChunk.sync('meow.wav', 0, 12);

audioType(buffer);
//=> wav
```

##### Browser

```js
var xhr = new XMLHttpRequest();
xhr.open('GET', 'meow.flac');
xhr.responseType = 'arraybuffer';

xhr.onload = function () {
	audioType(new Uint8Array(this.response));
	//=> flac
};

xhr.send();
```


## API

### audioType(buffer)

Returns: [`mp3`](https://github.com/hemanth/is-mp3), [`oga`](https://github.com/hemanth/is-ogg), [`flac`](https://github.com/hemanth/is-flac), [`wav`](https://github.com/hemanth/is-wav), [`m4a`](https://github.com/hemanth/is-m4a), `false`

#### buffer

Type: `buffer` *(Node.js)*, `uint8array`

It only needs the first 12 bytes.


## CLI

```sh
$ npm install --global audio-type
```

```sh
$ audio-type --help

Usage
  $ cat <filename> | audio-type
  $ audio-type <filename>

Example
  $ cat meow.mp3 | audio-type
  mp3
```


## License

MIT © [Hemanth.HM](http://H3manth.com)
