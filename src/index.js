/**
 * https://developers.google.com/doubleclick-gpt/reference
*/
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';

export const Format = {
  HORIZONTAL: 'HORIZONTAL',
  RECTANGLE: 'RECTANGLE',
  VERTICAL: 'VERTICAL',
  MOBILE: 'MOBILE',
};

export const Dimensions = {
  [Format.HORIZONTAL]: [[970, 90], [728, 90], [468, 60], [234, 60]],
  [Format.RECTANGLE]: [[336, 280], [300, 250], [250, 250], [200, 200], [180, 150], [125, 125]],
  [Format.VERTICAL]: [[300, 600], [160, 600], [120, 600], [120, 240]],
  [Format.MOBILE]: [[320, 50]],
  '300x600': [[300, 600], [160, 600]],
  '336x280': [[336, 280], [300, 250]],
  '728x90': [[728, 90], [468, 60]],
  '970x90': [[970, 90], [728, 90], [468, 60]],
};

let nextID = 1;
let googletag = null;

function getNextID() {
  return 'rgpt-' + (nextID++);
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
    const gads = document.createElement('script');
    gads.async = true;
    gads.type = 'text/javascript';
    gads.src = '//www.googletagservices.com/tag/js/gpt.js';

    const head = document.getElementsByTagName('head')[0];
    head.appendChild(gads);
  })();
}

export default class GooglePublisherTag extends Component {
  static propTypes = {
    className: React.PropTypes.string,
    path: React.PropTypes.string.isRequired,
    format: React.PropTypes.string.isRequired,
    responsive: React.PropTypes.bool.isRequired,
    canBeLower: React.PropTypes.bool.isRequired, // can be ad lower than original size,

    dimensions: React.PropTypes.array,  // [[300, 600], [160, 600]]

    minWindowWidth: React.PropTypes.number.isRequired,
    maxWindowWidth: React.PropTypes.number.isRequired,
  };

  static defaultProps = {
    format: Format.HORIZONTAL,
    responsive: true,
    canBeLower: true,
    dimensions: null,
    minWindowWidth: -1,
    maxWindowWidth: -1,
  };

  constructor(props, context) {
    super(props, context);

    const { dimensions, format, canBeLower } = props;

    this.state = {
      availableDimensions: GooglePublisherTag.prepareDimensions(dimensions, format, canBeLower),
    };
  }

  componentDidMount() {
    initGooglePublisherTag();

    if (this.props.responsive) {
      window.addEventListener('resize', this.handleResize);
    }

    googletag.cmd.push(() => this.setState({
      initialized: true,
      windowWidth: window.innerWidth,
    }));
  }

  componentWillReceiveProps(props) {
    const { dimensions, format, canBeLower } = props;

    this.setState({
      availableDimensions: GooglePublisherTag.prepareDimensions(dimensions, format, canBeLower),
    });
  }

  componentDidUpdate() {
    const { path, responsive, minWindowWidth, maxWindowWidth } = this.props;
    const {
      id,
      initialized,
      windowWidth,
      currentDimensions,
      availableDimensions,
      slot,
    } = this.state;

    // need to wait for initialization
    if (!initialized) {
      return;
    }

    // reduce dimensions to current width
    const node = findDOMNode(this);
    if (!node) {
      return;
    }

    const componentWidth = node.offsetWidth;
    let dimensions = responsive
      ? availableDimensions.filter((dimension) => dimension[0] <= componentWidth)
      : dimensions;

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
        id: getNextID(),
      });
      return;
    }

    // init newSlot - div is ready
    const newSlot = googletag.defineSlot(path, dimensions, id);
    newSlot.addService(googletag.pubads());

    googletag.display(id);
    googletag.pubads().refresh([newSlot]);

    this.setState({
      slot: newSlot,
      currentDimensions: dimensions,
    });
  }

  componentWillUnmount() {
    // TODO sometimes can props changed
    if (this.props.responsive) {
      window.removeEventListener('resize', this.handleResize);
    }

    this.removeSlot();
  }

  removeSlot() {
    const slot = this.state.slot;
    if (slot) {
      googletag.pubads().clear([slot]);
    }

    this.setState({
      id: null,
      slot: null,
      currentDimensions: null,
    });
  }

  refreshSlot() {
    const slot = this.state.slot;
    if (slot) {
      googletag.pubads().refresh([slot]);
    }
  }

  handleResize = () => {
    this.setState({
      windowWidth: window.innerWidth,
    });
  }

  static prepareDimensions(dimensions, format = Format.HORIZONTAL, canBeLower = true) {
    if (!dimensions || !dimensions.length) {
      return Dimensions[format];
    }

    if (dimensions.length === 1 && canBeLower) {
      const dimension = dimensions[0];
      const key = `${dimension[0]}x${dimension[1]}`;

      if (Dimensions[key]) {
        return Dimensions[key];
      }
    }

    return dimensions;
  }

  render() {
    const id = this.state.id;

    return (
      <div className={this.props.className}>
        {id ? <div id={id} /> : null}
      </div>
    );
  }
}
