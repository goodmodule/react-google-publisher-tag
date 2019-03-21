// @flow
import React from 'react';
import Ad from './GooglePublisherTag';
import Format from './constants/Format';

type Props = {
  small?: boolean,
};

export default function Mobile(props: Props) {
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

Mobile.defaultProps = {
  small: false,
};
