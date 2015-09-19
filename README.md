# React Google Publisher Tag

## Motivation

I needed to show adsense via google publisher tag in my react isomorphic application


## Install
```sh
npm install react-google-publisher-tag
```

## Features

 * Automatically show AD and fit the size
 * Automatically load google script
 * Support for mobile
 * Support for isomorphic applications
 * Support for responsible layout


## Usage

 - Go to https://www.google.com/dfp and create a new Ad unit. (tab Inventory)
 - Add sizes: 120x240, 120x600, 125x125, 160x600, 180x150, 200x200, 234x60, 240x400, 250x250, 300x100, 300x250, 300x600, 320x50, 336x280, 468x60, 728x90, 970x90
 - Use ad code as path in the react component


### App.jsx

Application part (load google analytics script to your webpage on the client side).
ReactGAnalytics has parameter ID (use your own ID)

```js
var React = require('react');
var AD = require('react-google-publisher-tag');

var App = module.exports = React.createClass({
  render: function() {
    return (
      <div id="application">
        <AD path="your-code-from-doubleclick-for-publishers" />
        <RouteHandler />
      </div>
    );
  }
});
```

## Parameters

| Name       |     Type  |  Required | Default    |
|------------|-----------|-----------|------------|
| path       | String    | true      |            |
| responsive | Boolean   | true      | true       |
| format     | String    | true      | HORIZONTAL |
| canBeLower | Boolean   | true      | true       |
| mobile     | Boolean   | true      | false      |
| mobileWidth| Integer   | true      | 480        |
| media      | Boolean   | false     |            |
| dimensions | Array     | false     |            |

## Formats

It will setup ad size automatically for this component:
HORIZONTAL [[970, 90], [728, 90], [468, 60], [234, 60]]
RECTANGLE [[336, 280], [300, 250], [250, 250], [200, 200], [180, 150], [125, 125]]
VERTICAL [[300, 600], [160, 600], [120, 600], [120, 240]]


## Credits

[Zlatko Fedor](http://github.com/seeden)

## License

The MIT License (MIT)

Copyright (c) 2015 Zlatko Fedor zlatkofedor@cherrysro.com
