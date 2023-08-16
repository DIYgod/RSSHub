import React from 'react';

export default function Badge({
  text = '',
  type = 'tip',
}: {
  text: string;
  type: string;
}): JSX.Element {
  return (
    <span className={`badge ${type}`}>{text}</span>
  )
}
