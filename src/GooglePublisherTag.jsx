/**
 * https://developers.google.com/doubleclick-gpt/reference
*/
import React, { PureComponent, type Node } from 'react';
import Measure from 'react-measure';
import debounce from 'lodash/debounce';
import Format from './constants/Format';
import Dimensions from './constants/Dimensions';

let nextId: number = 1;

function getNextId(): string {
  nextId += 1;

  return `rgpt-${nextId}`;
}

function prepareDimensions(
  dimensions,
  format: string = Format.HORIZONTAL,
  canBeLower: boolean = true,
) {
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

function loadScript(): void {
  const js = document.createElement('script');
  js.async = true;
  js.defer = true;
  js.src = 'https://www.googletagservices.com/tag/js/gpt.js';

  document.body.appendChild(js);
}

function initGooglePublisherTag(options?: Object = {}, onInit?: Function): void {
  const {
    path,
    onImpressionViewable,
    onSlotRenderEnded,
    onSlotVisibilityChanged,
  } = options;

  const firstTime = !window.googletag;

  const googletag = window.googletag = window.googletag || {};
  googletag.cmd = googletag.cmd || [];

  if (firstTime) {
    googletag.cmd.push(() => {
      if (options.enableSingleRequest) {
        // Infinite scroll requires SRA
        googletag.pubads().enableSingleRequest();
      }

      // collapse div without ad
      // googletag.pubads().collapseEmptyDivs();

      // load ad with slot refresh
      googletag.pubads().disableInitialLoad();

      // enable google publisher tag
      googletag.enableServices();
    });

    loadScript();
  }

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

  // Execute callback whenever the on-screen percentage of an ad slot's area changes
  if (onSlotVisibilityChanged) {
    googletag.cmd.push(() => {
      googletag.pubads().addEventListener('slotVisibilityChanged', (event) => {
        if (event.slot.getAdUnitPath() === path) {
          onSlotVisibilityChanged(event);
        }
      });
    });
  }

  if (onInit) {
    googletag.cmd.push(() => {
      onInit(googletag);
    });
  }
}

type Props = {
  id?: string,
  path: string,
  format?: string,
  canBeLower?: boolean, // can be ad lower than original size,
  enableSingleRequest?: boolean,
  dimensions?: string[], // [[300, 600], [160, 600]]
  targeting?: Object,
  resizeDebounce?: number,
  onSlotRenderEnded?: Function,
  onSlotVisibilityChanged?: Function,
  onImpressionViewable?: Function,
  collapseEmpty?: boolean,
  fluid?: boolean,
};

type State = {
  bounds?: {
    width: number,
    height: number,
  }
};

export default class GooglePublisherTag extends PureComponent<Props, State> {
  googletag: Object;
  node: Node;

  state = {};

  handleResize = (contentRect) => {
    this.setState({
      bounds: contentRect.bounds,
    }, () => {
      this.update(this.props);
    });
  }

  update = debounce((props: Props) => {
    const {
      id,
      node,
      googletag,
      state: {
        bounds,
      },
    } = this;

    if (!googletag || !node || !bounds) {
      return;
    }

    const { width } = bounds;

    const {
      dimensions,
      format,
      canBeLower,
      targeting,
      collapseEmpty,
      fluid,
    } = props;

    const availableDimensions = prepareDimensions(dimensions, format, canBeLower)
      .filter(dimension => dimension === 'fluid' || dimension[0] <= width);

    if (fluid && !availableDimensions.find(dimension => dimension === 'fluid')) {
      availableDimensions.push('fluid');
    }

    // do nothink
    if (JSON.stringify(targeting) === JSON.stringify(this.currentTargeting)
      && JSON.stringify(availableDimensions) === JSON.stringify(this.currentDimensions)) {
      return;
    }

    this.currentTargeting = targeting;
    this.currentDimensions = availableDimensions;

    // remove current slot because dimensions is changed and current slot is old
    this.removeSlot();

    // there is nothink to display
    if (!availableDimensions || !availableDimensions.length) {
      return;
    }

    // prepare new node content
    const adId = id || getNextId();
    node.innerHTML = `<div id="${adId}"></div>`;

    // prepare new slot
    const slot = googletag.defineSlot(props.path, availableDimensions, adId);
    this.slot = slot;

    // set targeting
    if (targeting) {
      Object.keys(targeting).forEach((key) => {
        slot.setTargeting(key, targeting[key]);
      });
    }

    // set collapsing
    if (typeof collapseEmpty !== 'undefined') {
      const args = Array.isArray(collapseEmpty)
        ? collapseEmpty
        : [collapseEmpty];

      slot.setCollapseEmptyDiv(...args);
    }

    slot.addService(googletag.pubads());

    // display new slot
    googletag.display(adId);
    googletag.pubads().refresh([slot]);
  }, this.props.resizeDebounce)

  componentDidMount() {
    const {
      path,
      onImpressionViewable,
      onSlotRenderEnded,
      onSlotVisibilityChanged,
    } = this.props;

    const options = {
      path,
      onImpressionViewable,
      onSlotRenderEnded,
      onSlotVisibilityChanged,
    };

    initGooglePublisherTag(options, (googletag: Object) => {
      this.googletag = googletag;
      this.update(this.props);
    });
  }

  UNSAFE_componentWillReceiveProps(props) {
    this.update(props);
  }

  componentWillUnmount() {
    this.removeSlot();
  }

  removeSlot() {
    const { slot, googletag, node } = this;
    if (slot && googletag) {
      googletag.destroySlots([slot]);
      this.slot = null;

      if (node) {
        node.innerHTML = null;
      }
    }
  }

  refreshSlot() {
    const { slot, googletag } = this;
    if (slot && googletag) {
      googletag.pubads().refresh([slot]);
    }
  }

  handleNode = (node: Node) => {
    this.node = node;

    this.update(this.props);
  }

  render() {
    return (
      <Measure onResize={this.handleResize} bounds>
        {({ measureRef }) => (
          <div ref={measureRef}>
            <div ref={this.handleNode} />
          </div>
        )}
      </Measure>
    );
  }
}

GooglePublisherTag.defaultProps = {
  id: undefined,
  format: Format.MOBILE_HORIZONTAL,
  canBeLower: true,
  enableSingleRequest: false,
  dimensions: undefined,
  targeting: undefined,
  resizeDebounce: 100,
  onSlotRenderEnded: undefined,
  onSlotVisibilityChanged: undefined,
  onImpressionViewable: undefined,
  collapseEmpty: false,
  fluid: false,
};
