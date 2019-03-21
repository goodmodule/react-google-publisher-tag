// @flow
import React from 'react';
import Ad from './GooglePublisherTag';
import Format from './constants/Format';

type Props = {
  mobile?: boolean,
};

export default function Horizontal(props) {
  const { mobile } = props;
  const format = mobile
    ? Format.MOBILE_HORIZONTAL
    : Format.HORIZONTAL;

  return (
    <Ad
      {...props}
      format={format}
    />
  );
}
