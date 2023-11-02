import { useEffect } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { docsearch } from 'meilisearch-docsearch';

import 'meilisearch-docsearch/css';
import './variables.css';

export default function SearchBarWrapper() {
  const { siteConfig } = useDocusaurusContext();
  useEffect(() => {
    const docSearchOptions = siteConfig.customFields['meilisearch-docsearch'];
    docsearch(docSearchOptions)
  }, [])

  return (
      <div id="docsearch"></div>
  );
}
