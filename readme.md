# audio-type [![stable](https://img.shields.io/badge/stability-stable-brightgreen.svg)](http://github.com/badges/stability-badges) [![npm](https://img.shields.io/npm/v/audio-type.svg)](https://www.npmjs.com/package/audio-type) [![license](https://img.shields.io/npm/l/audio.svg)](https://www.npmjs.com/package/audio-type)

> Detect the audio type of a ArrayBuffer/Uint8Array

## Install

```sh
$ npm i audio-type
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
	audioType(this.response);
	//=> flac
};

xhr.send();
```


## API

### audioType(buffer)

Returns: [`mp3`](https://github.com/hemanth/is-mp3), [`oga`](https://github.com/hemanth/is-ogg), [`flac`](https://github.com/hemanth/is-flac), [`wav`](https://github.com/hemanth/is-wav), [`m4a`](https://github.com/hemanth/is-m4a)

#### buffer

Type: `buffer` *(Node.js)*, `arrayBuffer`, `uint8array`

It only needs the first 12 bytes.

## License

MIT © [Hemanth.HM](http://H3manth.com)
