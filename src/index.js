/**
 * https://developers.google.com/doubleclick-gpt/reference
*/

import React, { Component } from 'react';
import keymirror from 'keymirror';

export const Format = keymirror({
  HORIZONTAL: null,
  RECTANGLE: null,
  VERTICAL: null
});

export const Dimensions = {
  [Format.HORIZONTAL]: [[970, 90], [728, 90], [468, 60], [234, 60]],
  [Format.RECTANGLE]: [[336, 280], [300, 250], [250, 250], [200, 200], [180, 150], [125, 125]],
  [Format.VERTICAL]: [[300, 600], [160, 600], [120, 600], [120, 240]],
  MOBILE: [[320, 50]],
  '300x600': [[300, 600], [160, 600]],
  '336x280': [[336, 280], [300, 250]],
  '728x90': [[728, 90], [468, 60]],
  '970x90': [[970, 90], [728, 90], [468, 60]]
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

  googletag.cmd.push(function() {
    // add support for async loading
    googletag.pubads().enableAsyncRendering();

    // collapse div without ad
    googletag.pubads().collapseEmptyDivs();

    // load ad with slot refresh
    googletag.pubads().disableInitialLoad();

    // enable google publisher tag
    googletag.enableServices();
  });

  (function() {
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
    path: React.PropTypes.string.isRequired,
    responsive: React.PropTypes.bool.isRequired,
    format: React.PropTypes.string.isRequired,
    canBeLower: React.PropTypes.bool.isRequired, // can be ad lower than original size,

    dimensions: React.PropTypes.array,  // [[300, 600], [160, 600]]

    media: React.PropTypes.array,
    mobile: React.PropTypes.bool.isRequired,
    mobileWidth: React.PropTypes.number.isRequired
  }

  static defaultProps = {
    responsive: true,
    format: Format.HORIZONTAL,
    canBeLower: true,
    mobile: false,
    mobileWidth: 480
  }

  constructor(props, context) {
    super(props, context);

    this.handleResize = this.handleResize.bind(this);

    this.state = {
      id: null,
      slot: null,
      initialized: false,
      currentDimensionsJSON: null,
      dimensions: this.prepareDimensions(props)
    };
  }

  componentDidMount() {
    initGooglePublisherTag();

    if (this.props.responsive) {
      window.addEventListener('resize', this.handleResize);
    }

    googletag.cmd.push(() => this.setState({
      initialized: true,
      windowWidth: window.innerWidth
    }));
  }

  componentWillReceiveProps(props) {
    this.setState({
      dimensions: this.prepareDimensions(props)
    });
  }

  componentDidUpdate() {
    if (!this.state.initialized) {
      return;
    }

    const { path, responsive, mobile, mobileWidth } = this.props;
    const width = React.findDOMNode(this).offsetWidth;
    const { id, windowWidth, currentDimensionsJSON } = this.state;
    let { dimensions, slot } = this.state;

    // init slot
    if (id && !slot) {
      slot = googletag.defineSlot(path, JSON.parse(currentDimensionsJSON), id);
      slot.addService(googletag.pubads());

      googletag.display(id);
      googletag.pubads().refresh([slot]);

      this.setState({ slot });
      return;
    }

    // reduce dimensions to current width
    if (responsive) {
      dimensions = dimensions.filter(function(dimension) {
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

    const dimensionsJSON = JSON.stringify(dimensions);
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

  componentWillUnmount() {
    if (this.props.responsive) {
      window.removeEventListener('resize', this.handleResize);
    }

    this.removeSlot();
  }

  getWindowWidth() {
    return window.innerWidth;
  }

  prepareDimensions(props) {
    const { dimensions, format } = props;

    if (!dimensions || !dimensions.length) {
      return Dimensions[format];
    }

    if (dimensions.length === 1 && this.props.canBeLower) {
      const dimension = dimensions[0];
      const key = `${dimension[0]}x${dimension[1]}`;

      if (Dimensions[key]) {
        return Dimensions[key];
      }
    }

    return dimensions;
  }

  removeSlot() {
    if (!this.state.slot) {
      return;
    }

    const slots = [this.state.slot];
    googletag.pubads().clear(slots);

    this.setState({
      id: null,
      slot: null,
      currentDimensionsJSON: null
    });
  }

  refreshSlot() {
    if (!this.state.slot) {
      return;
    }

    const slots = [this.state.slot];
    googletag.pubads().refresh(slots);
  }

  handleResize() {
    this.setState({
      windowWidth: window.innerWidth
    });
  }

  render() {
    const id = this.state.id;
    const content = id ? <div id={id} /> : null;

    return (
      <div>{content}</div>
    );
  }
}
