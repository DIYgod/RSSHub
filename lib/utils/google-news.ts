import parser from '@/utils/rss-parser';

type GoogleNewsOptions = {
    hl?: string;
    gl?: string;
    ceid?: string;
};

const googleNewsUrl = (query: string, { hl = 'en-US', gl = 'US', ceid = 'US:en' }: GoogleNewsOptions = {}) => `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${hl}&gl=${gl}&ceid=${ceid}`;

const fetchGoogleNews = (query: string, options?: GoogleNewsOptions) => parser.parseURL(googleNewsUrl(query, options));

export { fetchGoogleNews, googleNewsUrl };
