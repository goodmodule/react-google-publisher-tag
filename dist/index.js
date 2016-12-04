'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash.debounce');

var _lodash2 = _interopRequireDefault(_lodash);

var _Format = require('./constants/Format');

var _Format2 = _interopRequireDefault(_Format);

var _Dimensions = require('./constants/Dimensions');

var _Dimensions2 = _interopRequireDefault(_Dimensions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * https://developers.google.com/doubleclick-gpt/reference
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */


function prepareDimensions(dimensions) {
  var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _Format2.default.HORIZONTAL;
  var canBeLower = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  if (!dimensions || !dimensions.length) {
    return _Dimensions2.default[format] || [];
  }

  if (dimensions.length === 1 && canBeLower) {
    var dimension = dimensions[0];
    var key = dimension[0] + 'x' + dimension[1];

    if (_Dimensions2.default[key]) {
      return _Dimensions2.default[key] || [];
    }
  }

  return dimensions;
}

var nextId = 1;
var googletag = null;

function getNextId() {
  nextId += 1;

  return 'rgpt-' + nextId;
}

function loadScript() {
  var gads = document.createElement('script');
  gads.async = true;
  gads.type = 'text/javascript';
  gads.src = '//www.googletagservices.com/tag/js/gpt.js';

  var head = document.getElementsByTagName('head')[0];
  head.appendChild(gads);
}

function initGooglePublisherTag(props) {
  var exitAfterAddingCommands = !!googletag;

  if (!googletag) {
    googletag = window.googletag = window.googletag || {};
    googletag.cmd = googletag.cmd || [];
  }

  var onImpressionViewable = props.onImpressionViewable,
      onSlotRenderEnded = props.onSlotRenderEnded,
      path = props.path;

  // Execute callback when the slot is visible in DOM (thrown before 'impressionViewable' )

  if (typeof onSlotRenderEnded === 'function') {
    googletag.cmd.push(function () {
      googletag.pubads().addEventListener('slotRenderEnded', function (event) {
        // check if the current slot is the one the callback was added to
        // (as addEventListener is global)
        if (event.slot.getAdUnitPath() === path) {
          onSlotRenderEnded(event);
        }
      });
    });
  }

  // Execute callback when ad is completely visible in DOM
  if (typeof onImpressionViewable === 'function') {
    googletag.cmd.push(function () {
      googletag.pubads().addEventListener('impressionViewable', function (event) {
        if (event.slot.getAdUnitPath() === path) {
          onImpressionViewable(event);
        }
      });
    });
  }

  if (exitAfterAddingCommands) {
    return;
  }

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

  loadScript();
}

var GooglePublisherTag = function (_Component) {
  _inherits(GooglePublisherTag, _Component);

  function GooglePublisherTag() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, GooglePublisherTag);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = GooglePublisherTag.__proto__ || Object.getPrototypeOf(GooglePublisherTag)).call.apply(_ref, [this].concat(args))), _this), _this.onResize = function () {
      var resizeDebounce = _this.props.resizeDebounce;


      if (!_this.resizeDebounce) {
        _this.resizeDebounce = (0, _lodash2.default)(function () {
          return _this.update(_this.props);
        }, resizeDebounce);
      }

      _this.resizeDebounce();
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(GooglePublisherTag, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      initGooglePublisherTag(this.props);

      if (this.props.responsive) {
        window.addEventListener('resize', this.onResize);
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
        window.removeEventListener('resize', this.onResize);
      }

      this.removeSlot();
    }
  }, {
    key: 'update',
    value: function update(props) {
      if (!this.initialized) {
        return;
      }

      var node = this.node;

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
      var minWindowWidth = props.minWindowWidth,
          maxWindowWidth = props.maxWindowWidth,
          targeting = props.targeting;


      if (minWindowWidth !== undefined && minWindowWidth < windowWidth) {
        dimensions = [];
      } else if (maxWindowWidth !== undefined && maxWindowWidth > windowWidth) {
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

      // prepare new node content
      var id = getNextId();
      node.innerHTML = '<div id="' + id + '"></div>';

      // prepare new slot
      var slot = this.slot = googletag.defineSlot(props.path, dimensions, id);

      // set targeting
      if (targeting) {
        Object.keys(targeting).forEach(function (key) {
          slot.setTargeting(key, targeting[key]);
        });
      }

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

      if (this.node) {
        this.node.innerHTML = null;
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
      var _this3 = this;

      return _react2.default.createElement('div', { className: this.props.className, ref: function ref(node) {
          _this3.node = node;
        } });
    }
  }]);

  return GooglePublisherTag;
}(_react.Component);

GooglePublisherTag.propTypes = {
  className: _react.PropTypes.string,
  path: _react.PropTypes.string.isRequired,
  format: _react.PropTypes.string.isRequired,
  responsive: _react.PropTypes.bool.isRequired,
  canBeLower: _react.PropTypes.bool.isRequired, // can be ad lower than original size,
  dimensions: _react.PropTypes.array, // [[300, 600], [160, 600]]
  minWindowWidth: _react.PropTypes.number,
  maxWindowWidth: _react.PropTypes.number,
  targeting: _react.PropTypes.object,
  resizeDebounce: _react.PropTypes.bool.isRequired
};
GooglePublisherTag.defaultProps = {
  format: _Format2.default.HORIZONTAL,
  responsive: true,
  canBeLower: true,
  dimensions: null,
  resizeDebounce: 100
};
exports.default = GooglePublisherTag;