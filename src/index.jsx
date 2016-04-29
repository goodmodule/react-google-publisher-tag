/**
 * https://developers.google.com/doubleclick-gpt/reference
*/
import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import keymirror from 'keymirror';
import forOwn from 'lodash/forOwn';

export const Format = keymirror({
  HORIZONTAL: null,
  RECTANGLE: null,
  VERTICAL: null,
  MOBILE: null,
});

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

function prepareDimensions(dimensions, format = Format.HORIZONTAL, canBeLower = true) {
  if (!dimensions || !dimensions.length) {
    return Dimensions[format] || [];
  }

  if (dimensions.length === 1 && canBeLower) {
    const dimension = dimensions[0];
    const key = `${dimension[0]}x${dimension[1]}`;

    if (Dimensions[key]) {
      return Dimensions[key] || [];
    }
  }

  return dimensions;
}

let nextID = 1;
let googletag = null;

function getNextID() {
  return `rgpt-${nextID++}`;
}

function loadScript() {
  const gads = document.createElement('script');
  gads.async = true;
  gads.type = 'text/javascript';
  gads.src = '//www.googletagservices.com/tag/js/gpt.js';

  const head = document.getElementsByTagName('head')[0];
  head.appendChild(gads);
}

function initGooglePublisherTag(props) {
  const exitAfterAddingCommands = !!googletag;

  if (!googletag) {
    googletag = window.googletag = window.googletag || {};
    googletag.cmd = googletag.cmd || [];
  }

  const { onImpressionViewable, onSlotRenderEnded, path } = props;

  // Execute callback when the slot is visible in DOM (thrown before 'impressionViewable' )
  if (typeof onSlotRenderEnded === 'function') {
    googletag.cmd.push(function addCallback() {
      googletag.pubads().addEventListener('slotRenderEnded', function slotRenderEnded(event) {
        // check if the current slot is the one the callback was added to (as addEventListener is global)
        if (event.slot.getAdUnitPath() === path) {
          onSlotRenderEnded(event);
        }
      });
    });
  }
  // Execute callback when ad is completely visible in DOM
  if (typeof onImpressionViewable === 'function') {
    googletag.cmd.push(function addCallback() {
      googletag.pubads().addEventListener('impressionViewable', function imporessionViewable(event) {
        if (event.slot.getAdUnitPath() === path) {
          onImpressionViewable(event);
        }
      });
    });
  }

  if (exitAfterAddingCommands) {
    return;
  }

  googletag.cmd.push(() => {
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

export default class GooglePublisherTag extends Component {
  static propTypes = {
    className: PropTypes.string,
    path: PropTypes.string.isRequired,
    format: PropTypes.string.isRequired,
    responsive: PropTypes.bool.isRequired,
    canBeLower: PropTypes.bool.isRequired, // can be ad lower than original size,

    dimensions: PropTypes.array,  // [[300, 600], [160, 600]]

    minWindowWidth: PropTypes.number.isRequired,
    maxWindowWidth: PropTypes.number.isRequired,
    targeting: PropTypes.object,
  };

  static defaultProps = {
    format: Format.HORIZONTAL,
    responsive: true,
    canBeLower: true,
    dimensions: null,
    minWindowWidth: -1,
    maxWindowWidth: -1,
  };

  componentDidMount() {
    initGooglePublisherTag(this.props);

    if (this.props.responsive) {
      window.addEventListener('resize', this.handleResize);
    }

    googletag.cmd.push(() => {
      this.initialized = true;

      this.update(this.props);
    });
  }

  componentWillReceiveProps(props) {
    this.update(props);
  }

  componentWillUnmount() {
    // TODO sometimes can props changed
    if (this.props.responsive) {
      window.removeEventListener('resize', this.handleResize);
    }

    this.removeSlot();
  }

  update(props) {
    if (!this.initialized) {
      return;
    }

    const node = findDOMNode(this);
    if (!node) {
      return;
    }

    const componentWidth = node.offsetWidth;
    const availableDimensions = prepareDimensions(props.dimensions, props.format, props.canBeLower);

    // filter by available node space
    let dimensions = props.responsive
      ? availableDimensions.filter((dimension) => dimension[0] <= componentWidth)
      : availableDimensions;


    // filter by min and max width
    const windowWidth = window.innerWidth;
    const { minWindowWidth, maxWindowWidth, targeting, collapseEmptyDiv } = props;

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
    const id = getNextID();
    this.refs.holder.innerHTML = `<div id="${id}"></div>`;

    // prepare new slot
    const slot = this.slot = googletag.defineSlot(props.path, dimensions, id);

    // set targeting
    if (targeting) {
      forOwn(targeting, (value, key) => {
        slot.setTargeting(key, value);
      });
    }

    if (typeof collapseEmptyDiv !== 'undefined') {
      if (Array.isArray(collapseEmptyDiv)) {
        slot.setCollapseEmptyDiv.apply('setCollapseEmptyDiv', collapseEmptyDiv);
      } else {
        slot.setCollapseEmptyDiv(collapseEmptyDiv);
      }
    }

    slot.addService(googletag.pubads());

    // display new slot
    googletag.display(id);
    googletag.pubads().refresh([slot]);
  }

  removeSlot() {
    if (!this.slot) {
      return;
    }

    googletag.pubads().clear([this.slot]);
    this.slot = null;

    if (this.refs.holder) {
      this.refs.holder.innerHTML = null;
    }
  }

  refreshSlot() {
    if (this.slot) {
      googletag.pubads().refresh([this.slot]);
    }
  }

  handleResize = () => {
    this.update(this.props);
  };

  render() {
    return (
      <div className={this.props.className} ref="holder" />
    );
  }
}
