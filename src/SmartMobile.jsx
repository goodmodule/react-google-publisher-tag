import React from 'react';
import PropTypes from 'prop-types';
import Mobile from './Mobile';
import Horizontal from './Horizontal';

export default function SmartMobile(props) {
  const {
    small,
    mobileMaxWindowWidth,
    className,
    ...rest
  } = props;

  return (
    <div className={className}>
      <Horizontal minWindowWidth={mobileMaxWindowWidth + 1} {...rest} />
      <Mobile maxWindowWidth={mobileMaxWindowWidth} {...rest} />
    </div>
  );
}

SmartMobile.propTypes = {
  className: PropTypes.string,
  small: PropTypes.bool,
  mobileMaxWindowWidth: PropTypes.number,
};

SmartMobile.defaultProps = {
  className: undefined,
  small: undefined,
  mobileMaxWindowWidth: 576,
};
