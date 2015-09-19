'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _keymirror = require('keymirror');

var _keymirror2 = _interopRequireDefault(_keymirror);

/**
 * https://developers.google.com/doubleclick-gpt/reference
*/

var Format = (0, _keymirror2['default'])({
  HORIZONTAL: null,
  RECTANGLE: null,
  VERTICAL: null
});

exports.Format = Format;

var nextID = 1;
var initializedGPT = false;

function getNextID() {
  return 'rgpt-' + nextID++;
}

function initGooglePublisherTag() {
  if (initializedGPT) {
    return;
  }

  initializedGPT = true;

  var googletag = window.googletag = window.googletag || {};
  googletag.cmd = googletag.cmd || [];

  googletag.cmd.push(function () {
    // Infinite scroll requires SRA
    // googletag.pubads().enableSingleRequest();

    googletag.pubads().enableAsyncRendering();

    googletag.pubads().collapseEmptyDivs();

    // Disable initial load, we will use refresh() to fetch ads.
    // Calling this function means that display() calls just
    // register the slot as ready, but do not fetch ads for it.
    // googletag.pubads().disableInitialLoad();

    // Enable services
    googletag.enableServices();
  });

  // <script async src="//www.googletagservices.com/tag/js/gpt.js"></script>

  (function () {
    var gads = document.createElement('script');
    gads.async = true;
    gads.type = 'text/javascript';

    var useSSL = document.location.protocol === 'https:';
    gads.src = (useSSL ? 'https:' : 'http:') + '//www.googletagservices.com/tag/js/gpt.js';

    var node = document.getElementsByTagName('script')[0];
    node.parentNode.insertBefore(gads, node);
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

      window.googletag.cmd.push(function () {
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
      var dimensions = _state.dimensions;
      var slot = _state.slot;
      var _state2 = this.state;
      var id = _state2.id;
      var windowWidth = _state2.windowWidth;
      var currentDimensionsJSON = _state2.currentDimensionsJSON;

      // init slot
      if (id && !slot) {
        slot = window.googletag.defineSlot(path, JSON.parse(currentDimensionsJSON), id);
        slot.addService(window.googletag.pubads());

        window.googletag.display(id);

        this.setState({
          slot: slot
        });

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
          dimensions = [[320, 50]];
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
        if (format === Format.HORIZONTAL) {
          return [[970, 90], [728, 90], [468, 60], [234, 60]];
        } else if (format === Format.RECTANGLE) {
          return [[336, 280], [300, 250], [250, 250], [200, 200], [180, 150], [125, 125]];
        }
        return [[300, 600], [160, 600], [120, 600], [120, 240]];
      }

      if (dimensions.length === 1 && this.props.canBeLower) {
        var dimension = dimensions[0];
        var width = dimension[0];
        var height = dimension[1];

        if (width === 300 && height === 600) {
          return [[300, 600], [160, 600]];
        } else if (width === 336 && height === 280) {
          return [[336, 280], [300, 250]];
        } else if (width === 728 && height === 90) {
          return [[728, 90], [468, 60]];
        } else if (width === 970 && height === 90) {
          return [[970, 90], [728, 90], [468, 60]];
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
      window.googletag.pubads().clear(slots);

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
      window.googletag.pubads().refresh(slots);
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