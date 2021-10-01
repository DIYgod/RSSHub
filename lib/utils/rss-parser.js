import { get as getConfig } from '@/config/index.js';
const config = getConfig();
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
