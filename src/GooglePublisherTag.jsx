/**
 * https://developers.google.com/doubleclick-gpt/reference
*/
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Format from './constants/Format';
import Dimensions from './constants/Dimensions';

function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

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

let nextId = 1;
let googletag = null;

function getNextId() {
  nextId += 1;

  return `rgpt-${nextId}`;
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
  if (onSlotRenderEnded) {
    googletag.cmd.push(() => {
      googletag.pubads().addEventListener('slotRenderEnded', (event) => {
        // check if the current slot is the one the callback was added to
        // (as addEventListener is global)
        if (event.slot.getAdUnitPath() === path) {
          onSlotRenderEnded(event);
        }
      });
    });
  }

  // Execute callback when ad is completely visible in DOM
  if (onImpressionViewable) {
    googletag.cmd.push(() => {
      googletag.pubads().addEventListener('impressionViewable', (event) => {
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
    if (props.enableSingleRequest) {
      // Infinite scroll requires SRA
      googletag.pubads().enableSingleRequest();
    }

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
    enableSingleRequest: PropTypes.bool.isRequired,
    dimensions: PropTypes.array,  // [[300, 600], [160, 600]]
    minWindowWidth: PropTypes.number,
    maxWindowWidth: PropTypes.number,
    targeting: PropTypes.object,
    resizeDebounce: PropTypes.number.isRequired,
    onSlotRenderEnded: PropTypes.func,
  };

  static defaultProps = {
    format: Format.HORIZONTAL,
    responsive: true,
    canBeLower: true,
    enableSingleRequest: false,
    dimensions: null,
    resizeDebounce: 100,
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

    const { node } = this;
    if (!node) {
      return;
    }

    const preset_id = props.id || false

    const componentWidth = node.offsetWidth;
    const availableDimensions = prepareDimensions(props.dimensions, props.format, props.canBeLower);

    // filter by available node space
    let dimensions = props.responsive
      ? availableDimensions.filter(dimension => dimension[0] <= componentWidth)
      : availableDimensions;

    // filter by min and max width
    const windowWidth = window.innerWidth;
    const { minWindowWidth, maxWindowWidth, targeting, collapseEmptyDiv } = props;

    if (minWindowWidth !== undefined && windowWidth < minWindowWidth) {
      dimensions = [];
    } else if (maxWindowWidth !== undefined && windowWidth > maxWindowWidth) {
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
    const id = (preset_id) ? preset_id : getNextId();
    node.innerHTML = `<div id="${id}"></div>`;

    // prepare new slot
    const slot = googletag.defineSlot(props.path, dimensions, id);
    this.slot = slot;

    // set targeting
    if (targeting) {
      Object.keys(targeting).forEach((key) => {
        slot.setTargeting(key, targeting[key]);
      });
    }

    // set collapsing
    if (typeof collapseEmptyDiv !== 'undefined') {
      const args = Array.isArray(collapseEmptyDiv)
        ? collapseEmptyDiv
        : [collapseEmptyDiv];

      slot.setCollapseEmptyDiv(...args);
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

    if (this.node) {
      this.node.innerHTML = null;
    }
  }

  refreshSlot() {
    if (this.slot) {
      googletag.pubads().refresh([this.slot]);
    }
  }

  handleResize = () => {
    const { resizeDebounce } = this.props;

    if (!this.resizeDebounce) {
      this.resizeDebounce = debounce(
        () => this.update(this.props),
        resizeDebounce,
      );
    }

    this.resizeDebounce();
  }

  handleNode = (node) => {
    this.node = node;
  }

  render() {
    return (
      <div className={this.props.className} ref={this.handleNode} />
    );
  }
}
