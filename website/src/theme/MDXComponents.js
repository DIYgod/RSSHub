import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import Badge from '@site/src/components/Badge';
import Route from '@site/src/components/Route';

// https://docusaurus.io/docs/markdown-features/react#mdx-component-scope
export default {
    ...MDXComponents,
    Badge,
    Route,
};
