import { useEffect } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import 'meilisearch-docsearch/css';
import './style.css';

export default function SearchBarWrapper() {
  const { siteConfig } = useDocusaurusContext();
  useEffect(() => {
    const { docsearch } = require('meilisearch-docsearch');
    const docSearchOptions = siteConfig.customFields['meilisearch-docsearch'];

    return docsearch(docSearchOptions)
  }, [])

  return (
      <div id="docsearch"></div>
  );
}
