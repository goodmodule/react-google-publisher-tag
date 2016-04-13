# React Google Publisher Tag

## Motivation

I needed to show adsense via google publisher tag in my react isomorphic application.
Please read carefully (AdSense terms)[https://support.google.com/adsense/answer/48182?hl=en].
You are using this module on your own risk.

## Install
```sh
npm install react-google-publisher-tag
```

## Features

 * Automatically show AD and fit the size
 * Automatically load google script
 * Support for mobile (you can show different size for mobile users)
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
        <AD path="/network-code/ad-code" />
        <RouteHandler />
      </div>
    );
  }
});
```

## Parameters

| Name           |     Type  |  Required | Default    |
|----------------|-----------|-----------|------------|
| path           | String    | true      |            |
| responsive     | Boolean   | true      | true       |
| format         | String    | true      | HORIZONTAL |
| canBeLower     | Boolean   | true      | true       |
| dimensions     | Array     | false     |            |
| minWindowWidth | Integer   | false     | -1         |
| maxWindowWidth | Integer   | false     | -1         |
| className      | String    | false     |            |
| targeting      | Object    | false     |            |

## Path

Path is only one required parameter. The format is:
/network-code/ad-code

Example:

```js
/22222222/myad
```

## Network code

You can find your network code in the Admin tab (Google DFP).
This unique code is included in DFP tags to identify the network, ensuring that DFP looks in the correct network for line items that are targeted to a particular ad unit. It's displayed here to help you identify which network is associated with any DFP tags you have on your site.

## Ad code

You can find your ad code when you click on your ad in the Google DFP (Inventary tab)
Identifies the ad unit in the associated ad tag. Ad unit codes can be up to 100 characters in length. Only letters, numbers, underscores, hyphens, periods, asterisks, forward slashes, backslashes, exclamations, left angle brackets, colons and parentheses are allowed. Each code must be unique; you can't reuse codes you've used before. Once you've created the ad unit, you can't change the code.


## Formats

It will setup ad size automatically for this component:
 - HORIZONTAL [[970, 90], [728, 90], [468, 60], [234, 60]]
 - RECTANGLE [[336, 280], [300, 250], [250, 250], [200, 200], [180, 150], [125, 125]]
 - VERTICAL [[300, 600], [160, 600], [120, 600], [120, 240]]
 - MOBILE: [[320, 50]],
 - 300x600: [[300, 600], [160, 600]]
 - 336x280: [[336, 280], [300, 250]]
 - 728x90: [[728, 90], [468, 60]]
 - 970x90: [[970, 90], [728, 90], [468, 60]]

## Can be lower

You can allow lower ad size automatically. (Default: true)

## Targeting

Add custom targeting parameters for a slot. 
The object's attributes are the keys while their value is the value.

Example:
```
 { 
   color: 'red',
   sport: ['rugby', 'rowing']
 } 
 ```

## Credits

[Zlatko Fedor](http://github.com/seeden)

## License

The MIT License (MIT)

Copyright (c) 2015 Zlatko Fedor zlatkofedor@cherrysro.com
