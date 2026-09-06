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

const parser = new Parser<ParsedFeed, ParsedItem>({
    customFields: {
        item: ['magnet'],
    },
    headers: {
        'User-Agent': config.ua,
    },
});

export default parser;
