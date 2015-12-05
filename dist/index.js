/**
 * https://developers.google.com/doubleclick-gpt/reference
*/
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _Dimensions;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _keymirror = require('keymirror');

var _keymirror2 = _interopRequireDefault(_keymirror);

var Format = (0, _keymirror2['default'])({
  HORIZONTAL: null,
  RECTANGLE: null,
  VERTICAL: null,
  MOBILE: null
});

exports.Format = Format;
var Dimensions = (_Dimensions = {}, _defineProperty(_Dimensions, Format.HORIZONTAL, [[970, 90], [728, 90], [468, 60], [234, 60]]), _defineProperty(_Dimensions, Format.RECTANGLE, [[336, 280], [300, 250], [250, 250], [200, 200], [180, 150], [125, 125]]), _defineProperty(_Dimensions, Format.VERTICAL, [[300, 600], [160, 600], [120, 600], [120, 240]]), _defineProperty(_Dimensions, Format.MOBILE, [[320, 50]]), _defineProperty(_Dimensions, '300x600', [[300, 600], [160, 600]]), _defineProperty(_Dimensions, '336x280', [[336, 280], [300, 250]]), _defineProperty(_Dimensions, '728x90', [[728, 90], [468, 60]]), _defineProperty(_Dimensions, '970x90', [[970, 90], [728, 90], [468, 60]]), _Dimensions);

exports.Dimensions = Dimensions;
function prepareDimensions(dimensions) {
  var format = arguments.length <= 1 || arguments[1] === undefined ? Format.HORIZONTAL : arguments[1];
  var canBeLower = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

  if (!dimensions || !dimensions.length) {
    return Dimensions[format] || [];
  }

  if (dimensions.length === 1 && canBeLower) {
    var dimension = dimensions[0];
    var key = dimension[0] + 'x' + dimension[1];

    if (Dimensions[key]) {
      return Dimensions[key] || [];
    }
  }

  return dimensions;
}

var nextID = 1;
var googletag = null;

function getNextID() {
  return 'rgpt-' + nextID++;
}

function initGooglePublisherTag() {
  if (googletag) {
    return;
  }

  googletag = window.googletag = window.googletag || {};
  googletag.cmd = googletag.cmd || [];

  googletag.cmd.push(function prepareGoogleTag() {
    // add support for async loading
    googletag.pubads().enableAsyncRendering();

    // collapse div without ad
    googletag.pubads().collapseEmptyDivs();

    // load ad with slot refresh
    googletag.pubads().disableInitialLoad();

    // enable google publisher tag
    googletag.enableServices();
  });

  (function loadScript() {
    var gads = document.createElement('script');
    gads.async = true;
    gads.type = 'text/javascript';
    gads.src = '//www.googletagservices.com/tag/js/gpt.js';

    var head = document.getElementsByTagName('head')[0];
    head.appendChild(gads);
  })();
}

var GooglePublisherTag = (function (_Component) {
  _inherits(GooglePublisherTag, _Component);

  function GooglePublisherTag() {
    var _this = this;

    _classCallCheck(this, GooglePublisherTag);

    _get(Object.getPrototypeOf(GooglePublisherTag.prototype), 'constructor', this).apply(this, arguments);

    this.handleResize = function () {
      _this.update(_this.props);
    };
  }

  _createClass(GooglePublisherTag, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      initGooglePublisherTag();

      if (this.props.responsive) {
        window.addEventListener('resize', this.handleResize);
      }

      googletag.cmd.push(function () {
        _this2.initialized = true;

        _this2.update(_this2.props);
      });
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(props) {
      this.update(props);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      // TODO sometimes can props changed
      if (this.props.responsive) {
        window.removeEventListener('resize', this.handleResize);
      }

      this.removeSlot();
    }
  }, {
    key: 'update',
    value: function update(props) {
      if (!this.initialized) {
        return;
      }

      var node = (0, _reactDom.findDOMNode)(this);
      if (!node) {
        return;
      }

      var componentWidth = node.offsetWidth;
      var availableDimensions = prepareDimensions(props.dimensions, props.format, props.canBeLower);

      // filter by available node space
      var dimensions = props.responsive ? availableDimensions.filter(function (dimension) {
        return dimension[0] <= componentWidth;
      }) : availableDimensions;

      // filter by min and max width
      var windowWidth = window.innerWidth;
      var minWindowWidth = props.minWindowWidth;
      var maxWindowWidth = props.maxWindowWidth;

      if (minWindowWidth !== -1 && minWindowWidth < windowWidth) {
        dimensions = [];
      } else if (maxWindowWidth !== -1 && maxWindowWidth > windowWidth) {
        dimensions = [];
      }

      // do nothink
      if (JSON.stringify(dimensions) === JSON.stringify(this.currentDimensions)) {
        return;
      }

      this.currentDimensions = dimensions;

      if (this.slot) {
        // remove current slot because dimensions is changed and current slot is old
        this.removeSlot();
      }

      // there is nothink to display
      if (!dimensions || !dimensions.length) {
        return;
      }

      if (!this.refs.holder) {
        console.log('RGPT holder is undefined');
        return;
      }

      // prepare new node
      var id = getNextID();
      this.refs.holder.innerHTML = '<div id="' + id + '"></div>';

      // prepare new slot
      var slot = this.slot = googletag.defineSlot(props.path, dimensions, id);
      slot.addService(googletag.pubads());

      // display new slot
      googletag.display(id);
      googletag.pubads().refresh([slot]);
    }
  }, {
    key: 'removeSlot',
    value: function removeSlot() {
      if (!this.slot) {
        return;
      }

      googletag.pubads().clear([this.slot]);
      this.slot = null;

      if (this.refs.holder) {
        this.refs.holder.innerHTML = null;
      }
    }
  }, {
    key: 'refreshSlot',
    value: function refreshSlot() {
      if (this.slot) {
        googletag.pubads().refresh([this.slot]);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2['default'].createElement('div', { className: this.props.className, ref: 'holder' });
    }
  }], [{
    key: 'propTypes',
    value: {
      className: _react2['default'].PropTypes.string,
      path: _react2['default'].PropTypes.string.isRequired,
      format: _react2['default'].PropTypes.string.isRequired,
      responsive: _react2['default'].PropTypes.bool.isRequired,
      canBeLower: _react2['default'].PropTypes.bool.isRequired, // can be ad lower than original size,

      dimensions: _react2['default'].PropTypes.array, // [[300, 600], [160, 600]]

      minWindowWidth: _react2['default'].PropTypes.number.isRequired,
      maxWindowWidth: _react2['default'].PropTypes.number.isRequired
    },
    enumerable: true
  }, {
    key: 'defaultProps',
    value: {
      format: Format.HORIZONTAL,
      responsive: true,
      canBeLower: true,
      dimensions: null,
      minWindowWidth: -1,
      maxWindowWidth: -1
    },
    enumerable: true
  }]);

  return GooglePublisherTag;
})(_react.Component);

exports['default'] = GooglePublisherTag;