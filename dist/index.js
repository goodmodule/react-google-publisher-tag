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

  _createClass(GooglePublisherTag, null, [{
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

  function GooglePublisherTag(props, context) {
    var _this = this;

    _classCallCheck(this, GooglePublisherTag);

    _get(Object.getPrototypeOf(GooglePublisherTag.prototype), 'constructor', this).call(this, props, context);

    this.handleResize = function () {
      _this.setState({
        windowWidth: window.innerWidth
      });
    };

    var dimensions = props.dimensions;
    var format = props.format;
    var canBeLower = props.canBeLower;

    this.state = {
      availableDimensions: GooglePublisherTag.prepareDimensions(dimensions, format, canBeLower)
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
        return _this2.setState({
          initialized: true,
          windowWidth: window.innerWidth
        });
      });
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(props) {
      var dimensions = props.dimensions;
      var format = props.format;
      var canBeLower = props.canBeLower;

      this.setState({
        availableDimensions: GooglePublisherTag.prepareDimensions(dimensions, format, canBeLower)
      });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      var _props = this.props;
      var path = _props.path;
      var responsive = _props.responsive;
      var minWindowWidth = _props.minWindowWidth;
      var maxWindowWidth = _props.maxWindowWidth;
      var _state = this.state;
      var id = _state.id;
      var initialized = _state.initialized;
      var windowWidth = _state.windowWidth;
      var currentDimensions = _state.currentDimensions;
      var availableDimensions = _state.availableDimensions;
      var slot = _state.slot;

      // need to wait for initialization
      if (!initialized) {
        return;
      }

      // reduce dimensions to current width
      var node = (0, _reactDom.findDOMNode)(this);
      if (!node) {
        return;
      }

      var componentWidth = node.offsetWidth;
      var dimensions = responsive ? availableDimensions.filter(function (dimension) {
        return dimension[0] <= componentWidth;
      }) : dimensions;

      if (minWindowWidth !== -1 && minWindowWidth < windowWidth) {
        dimensions = [];
      }

      if (maxWindowWidth !== -1 && maxWindowWidth > windowWidth) {
        dimensions = [];
      }

      // destroy existing slot if exists
      if (!dimensions || !dimensions.length) {
        this.removeSlot();
        return;
      }

      // do nothink
      if (JSON.stringify(dimensions) === JSON.stringify(currentDimensions)) {
        return;
      } else if (slot) {
        // remove current slot because dimensions is changed and current slot is old
        this.removeSlot();
        return;
      }

      // first step generate new id and redraw component with new id
      if (!id) {
        this.setState({
          id: getNextID()
        });
        return;
      }

      // init newSlot - div is ready
      var newSlot = googletag.defineSlot(path, dimensions, id);
      newSlot.addService(googletag.pubads());

      googletag.display(id);
      googletag.pubads().refresh([newSlot]);

      this.setState({
        slot: newSlot,
        currentDimensions: dimensions
      });
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
    key: 'removeSlot',
    value: function removeSlot() {
      var slot = this.state.slot;
      if (slot) {
        googletag.pubads().clear([slot]);
      }

      this.setState({
        id: null,
        slot: null,
        currentDimensions: null
      });
    }
  }, {
    key: 'refreshSlot',
    value: function refreshSlot() {
      var slot = this.state.slot;
      if (slot) {
        googletag.pubads().refresh([slot]);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var id = this.state.id;

      return _react2['default'].createElement(
        'div',
        { className: this.props.className },
        id ? _react2['default'].createElement('div', { id: id }) : null
      );
    }
  }], [{
    key: 'prepareDimensions',
    value: function prepareDimensions(dimensions) {
      var format = arguments.length <= 1 || arguments[1] === undefined ? Format.HORIZONTAL : arguments[1];
      var canBeLower = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

      if (!dimensions || !dimensions.length) {
        return Dimensions[format];
      }

      if (dimensions.length === 1 && canBeLower) {
        var dimension = dimensions[0];
        var key = dimension[0] + 'x' + dimension[1];

        if (Dimensions[key]) {
          return Dimensions[key];
        }
      }

      return dimensions;
    }
  }]);

  return GooglePublisherTag;
})(_react.Component);

exports['default'] = GooglePublisherTag;