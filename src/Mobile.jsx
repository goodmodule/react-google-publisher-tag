import React from 'react';
import PropTypes from 'prop-types';
import Ad from './GooglePublisherTag';
import Format from './constants/Format';

export default function Mobile(props) {
  const {
    small,
    ...rest
  } = props;

  return (
    <Ad
      format={small ? Format.MOBILE : Format.MOBILE_BIG}
      {...rest}
    />
  );
}

Mobile.propTypes = {
  small: PropTypes.bool,
};

Mobile.defaultProps = {
  small: undefined,
};
