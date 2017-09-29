import React from 'react';
import Ad from './GooglePublisherTag';
import Format from './constants/Format';

export default function Horizontal(props) {
  return (
    <Ad
      {...props}
      format={Format.HORIZONTAL}
    />
  );
}
