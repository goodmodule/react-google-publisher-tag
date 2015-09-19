import React, { Component } from 'react';
import keymirror from 'keymirror';

/**
 * https://developers.google.com/doubleclick-gpt/reference
*/

const Format = keymirror({
  HORIZONTAL: null,
  RECTANGLE: null,
  VERTICAL: null
});

export { Format };

let nextID = 1;
let initializedGPT = false;

function getNextID() {
  return 'rgpt-' + (nextID++);
}

function initGooglePublisherTag() {
  if (initializedGPT) {
    return;
  }

  initializedGPT = true;

  const googletag = window.googletag = window.googletag || {};
  googletag.cmd = googletag.cmd || [];

  googletag.cmd.push(function() {
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

  (function() {
    const gads = document.createElement('script');
    gads.async = true;
    gads.type = 'text/javascript';

    const useSSL = document.location.protocol === 'https:';
    gads.src = (useSSL ? 'https:' : 'http:') + '//www.googletagservices.com/tag/js/gpt.js';

    const node = document.getElementsByTagName('script')[0];
    node.parentNode.insertBefore(gads, node);
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

    window.googletag.cmd.push(() => this.setState({
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

    let { dimensions, slot } = this.state;
    const { id, windowWidth, currentDimensionsJSON } = this.state;

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
      dimensions = dimensions.filter(function(dimension) {
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
      if (format === Format.HORIZONTAL) {
        return [[970, 90], [728, 90], [468, 60], [234, 60]];
      } else if (format === Format.RECTANGLE) {
        return [[336, 280], [300, 250], [250, 250], [200, 200], [180, 150], [125, 125]];
      }
      return [[300, 600], [160, 600], [120, 600], [120, 240]];
    }

    if (dimensions.length === 1 && this.props.canBeLower) {
      const dimension = dimensions[0];
      const width = dimension[0];
      const height = dimension[1];

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

  removeSlot() {
    if (!this.state.slot) {
      return;
    }

    const slots = [this.state.slot];
    window.googletag.pubads().clear(slots);

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
    window.googletag.pubads().refresh(slots);
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

