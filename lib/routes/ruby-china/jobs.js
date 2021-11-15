import got from '~/utils/got.js';
import cheerio from 'cheerio';

import {RUBY_CHINA_HOST} from './constants.js';
import utils from './utils.js';

export default async (ctx) => {
    const title = 'Ruby China - 招聘';
    const link = `${RUBY_CHINA_HOST}/jobs`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.topics .topic').get();

    const result = await utils.processTopics2Feed(list, ctx.cache);

    ctx.state.data = {
        title,
        link,
        description: title,
        item: result,
    };
};
