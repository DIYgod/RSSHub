import Parser from 'rss-parser';

import { config } from '@/config';

const parser = new Parser<Record<string, any>, Record<string, any>>({
    customFields: {
        item: ['magnet'],
    },
    headers: {
        'User-Agent': config.ua,
    },
});

export default parser;
