import got from '~/utils/got.js';
import cheerio from 'cheerio';
import qs from 'query-string';
import utils from './utils.js';

export default async (ctx) => {
    const { keyword } = ctx.params;
    const link = 'https://getitfree.cn';
    const query = {
        s: keyword,
    };
    const res = await got(link, {
        query,
    });
    const $ = cheerio.load(res.data);

    const item = utils.parseListItem($, '#page-content');

    ctx.state.data = {
        title: `正版中国搜索 - ${keyword}`,
        description: `正版中国搜索 - ${keyword}`,
        link: `${link}?${qs.stringify(query)}`,
        item,
    };
};
