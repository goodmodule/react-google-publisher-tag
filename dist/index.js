/**
 * https://developers.google.com/doubleclick-gpt/reference
*/

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _Dimensions;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _keymirror = require('keymirror');

var _keymirror2 = _interopRequireDefault(_keymirror);

var Format = (0, _keymirror2['default'])({
  HORIZONTAL: null,
  RECTANGLE: null,
  VERTICAL: null
});

exports.Format = Format;
var Dimensions = (_Dimensions = {}, _defineProperty(_Dimensions, Format.HORIZONTAL, [[970, 90], [728, 90], [468, 60], [234, 60]]), _defineProperty(_Dimensions, Format.RECTANGLE, [[336, 280], [300, 250], [250, 250], [200, 200], [180, 150], [125, 125]]), _defineProperty(_Dimensions, Format.VERTICAL, [[300, 600], [160, 600], [120, 600], [120, 240]]), _defineProperty(_Dimensions, 'MOBILE', [[320, 50]]), _defineProperty(_Dimensions, '300x600', [[300, 600], [160, 600]]), _defineProperty(_Dimensions, '336x280', [[336, 280], [300, 250]]), _defineProperty(_Dimensions, '728x90', [[728, 90], [468, 60]]), _defineProperty(_Dimensions, '970x90', [[970, 90], [728, 90], [468, 60]]), _Dimensions);

exports.Dimensions = Dimensions;
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

  googletag.cmd.push(function () {
    // add support for async loading
    googletag.pubads().enableAsyncRendering();

    // collapse div without ad
    googletag.pubads().collapseEmptyDivs();

    // load ad with slot refresh
    googletag.pubads().disableInitialLoad();

    // enable google publisher tag
    googletag.enableServices();
  });

  (function () {
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

  _createClass(GooglePublisherTag, null, [{
    key: 'propTypes',
    value: {
      path: _react2['default'].PropTypes.string.isRequired,
      responsive: _react2['default'].PropTypes.bool.isRequired,
      format: _react2['default'].PropTypes.string.isRequired,
      canBeLower: _react2['default'].PropTypes.bool.isRequired, // can be ad lower than original size,

      dimensions: _react2['default'].PropTypes.array, // [[300, 600], [160, 600]]

      media: _react2['default'].PropTypes.array,
      mobile: _react2['default'].PropTypes.bool.isRequired,
      mobileWidth: _react2['default'].PropTypes.number.isRequired
    },
    enumerable: true
  }, {
    key: 'defaultProps',
    value: {
      responsive: true,
      format: Format.HORIZONTAL,
      canBeLower: true,
      mobile: false,
      mobileWidth: 480
    },
    enumerable: true
  }]);

  function GooglePublisherTag(props, context) {
    _classCallCheck(this, GooglePublisherTag);

    _get(Object.getPrototypeOf(GooglePublisherTag.prototype), 'constructor', this).call(this, props, context);

    this.handleResize = this.handleResize.bind(this);

    this.state = {
      id: null,
      slot: null,
      initialized: false,
      currentDimensionsJSON: null,
      dimensions: this.prepareDimensions(props)
    };
  }

  _createClass(GooglePublisherTag, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      initGooglePublisherTag();

      if (this.props.responsive) {
        window.addEventListener('resize', this.handleResize);
      }

      googletag.cmd.push(function () {
        return _this.setState({
          initialized: true,
          windowWidth: window.innerWidth
        });
      });
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(props) {
      this.setState({
        dimensions: this.prepareDimensions(props)
      });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      if (!this.state.initialized) {
        return;
      }

      var _props = this.props;
      var path = _props.path;
      var responsive = _props.responsive;
      var mobile = _props.mobile;
      var mobileWidth = _props.mobileWidth;

      var width = _react2['default'].findDOMNode(this).offsetWidth;
      var _state = this.state;
      var id = _state.id;
      var windowWidth = _state.windowWidth;
      var currentDimensionsJSON = _state.currentDimensionsJSON;
      var _state2 = this.state;
      var dimensions = _state2.dimensions;
      var slot = _state2.slot;

      // init slot
      if (id && !slot) {
        slot = googletag.defineSlot(path, JSON.parse(currentDimensionsJSON), id);
        slot.addService(googletag.pubads());

        googletag.display(id);
        googletag.pubads().refresh([slot]);

        this.setState({ slot: slot });
        return;
      }

      // reduce dimensions to current width
      if (responsive) {
        dimensions = dimensions.filter(function (dimension) {
          return dimension[0] <= width;
        });
      }

      if (windowWidth <= mobileWidth) {
        if (mobile) {
          dimensions = Dimensions.MOBILE;
        } else if (!mobile && slot) {
          this.removeSlot();
          return;
        }
      }

      var dimensionsJSON = JSON.stringify(dimensions);
      if (dimensionsJSON === currentDimensionsJSON) {
        return;
      }

      if (slot) {
        this.removeSlot();
      }

      if (!dimensions.length) {
        return;
      }

      this.setState({
        id: getNextID(),
        currentDimensionsJSON: dimensionsJSON
      });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this.props.responsive) {
        window.removeEventListener('resize', this.handleResize);
      }

      this.removeSlot();
    }
  }, {
    key: 'getWindowWidth',
    value: function getWindowWidth() {
      return window.innerWidth;
    }
  }, {
    key: 'prepareDimensions',
    value: function prepareDimensions(props) {
      var dimensions = props.dimensions;
      var format = props.format;

      if (!dimensions || !dimensions.length) {
        return Dimensions[format];
      }

      if (dimensions.length === 1 && this.props.canBeLower) {
        var dimension = dimensions[0];
        var key = dimension[0] + 'x' + dimension[1];

        if (Dimensions[key]) {
          return Dimensions[key];
        }
      }

      return dimensions;
    }
  }, {
    key: 'removeSlot',
    value: function removeSlot() {
      if (!this.state.slot) {
        return;
      }

      var slots = [this.state.slot];
      googletag.pubads().clear(slots);

      this.setState({
        id: null,
        slot: null,
        currentDimensionsJSON: null
      });
    }
  }, {
    key: 'refreshSlot',
    value: function refreshSlot() {
      if (!this.state.slot) {
        return;
      }

      var slots = [this.state.slot];
      googletag.pubads().refresh(slots);
    }
  }, {
    key: 'handleResize',
    value: function handleResize() {
      this.setState({
        windowWidth: window.innerWidth
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var id = this.state.id;
      var content = id ? _react2['default'].createElement('div', { id: id }) : null;

      return _react2['default'].createElement(
        'div',
        null,
        content
      );
    }
  }]);

  return GooglePublisherTag;
})(_react.Component);

exports['default'] = GooglePublisherTag;