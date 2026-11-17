import Parser from 'rss-parser';

import { config } from '@/config';
import type { DataItem, Language } from '@/types';

interface ParsedFeed {
    author?: string;
    copyright?: string;
    creator?: string;
    generator?: string;
    language?: Language;
    lastBuildDate?: string;
    managingEditor?: string;
    pubDate?: string;
    publisher?: string;
    webMaster?: string;
}

type ParsedItem = Pick<DataItem, 'author' | 'category' | 'description' | 'enclosure_type' | 'enclosure_url' | 'id'> & {
    magnet?: string;
};

// A Parser reuses a single xml2js parser, whose state can outlive a malformed document and leak into the next one, so every document gets its own
const createParser = () =>
    new Parser<ParsedFeed, ParsedItem>({
        customFields: {
            item: ['magnet'],
        },
        headers: {
            'User-Agent': config.ua,
        },
        maxResponseSize: config.requestMaxResponseSize,
    });

export default {
    parseString: (xml: string) => createParser().parseString(xml),
    parseURL: (feedUrl: string) => createParser().parseURL(feedUrl),
};
