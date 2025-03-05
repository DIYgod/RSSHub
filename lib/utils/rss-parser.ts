import { config } from '@/config';
import Parser from 'rss-parser';

const parser = new Parser({
    customFields: {
        item: ['magnet'],
    },
    headers: {
        'User-Agent': config.ua,
    },
});

export default parser;
