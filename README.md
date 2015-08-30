# Broccoli Live Reload

Serve broccoli assets with watch rebuilding and live reload capabilities.

Tracks file diffs to prevent unnecessary reloading of the browser when unnecessary.

Not recommended for production use.

[![Version npm](https://img.shields.io/npm/v/broccoli-live-reload.svg?style=flat-square)](https://www.npmjs.com/package/broccoli-live-reload)[![Support via Gratipay](https://img.shields.io/gratipay/Bajix.svg)](https://gratipay.com/Bajix)[![NPM Downloads](https://img.shields.io/npm/dm/broccoli-live-reload.svg?style=flat-square)](https://www.npmjs.com/package/broccoli-live-reload)[![Build Status](https://img.shields.io/codeship/5c87c390-3128-0133-d618-0a744e9a501a.svg)](https://codeship.com/projects/99674)[![Dependencies](https://img.shields.io/david/Bajix/broccoli-live-reload.svg?style=flat-square)](https://david-dm.org/Bajix/broccoli-live-reload)

## Install

[![NPM](https://nodei.co/npm/broccoli-live-reload.png?downloads=true&downloadRank=true)](https://nodei.co/npm/broccoli-live-reload/)

## Documentation

### `LiveReload(options)`

`port` *{Number}*

Optional. Default is 35729

`path` *{String}*

Optional. Default is 'assets'. This is the path that you're mounting broccoli live reload onto, and is used to normalize paths to match their respective urls.

- `include` *{Array}*

Optional. If set, defines a set of [patterns](https://www.npmjs.com/package/minimatch) to match files against for tracking for inclusion. For example, if you're using a css-preprocessor, you should omit your input files from tracking to prevent their changes from forcing a reload. This allows for live reload to hot-swap styling without refreshing the page.

```
if (~process.argv.indexOf('--broccoli')) {
  app.use('/assets', require('broccoli-live-reload')({
    path: 'assets',
    include: [
      '**/*.js',
      '**/*.css'
    ]
  }));
} else {
  app.use('/assets', express.static('../public'));
}

```

- `exclude` *{Array}*

Optional. If set, defines a set of [patterns](https://www.npmjs.com/package/minimatch) to match files against for tracking for exclusion.

```
if (~process.argv.indexOf('--broccoli')) {
  app.use('/assets', require('broccoli-live-reload')({
    path: 'assets',
    exclude: [
      '**/*.swf',
      '**/*.png',
      '**/*.jpg'
    ]
  }));
} else {
  app.use('/assets', express.static('../public'));
}

```