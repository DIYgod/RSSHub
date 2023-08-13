import React from 'react';

export default function Badge({
  text = '',
  type = 'tip',
}: {
  text: string;
  type: string;
}): JSX.Element {
  return (
    <div className="badge"></div>
  )
}
