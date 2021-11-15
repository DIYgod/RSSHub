// Warning: The author still knows nothing about javascript!

// params:
// type: notification type

import got from '~/utils/got.js'; // get web content
import cheerio from 'cheerio'; // html parser
import get_article from './_article.js';

const base_url = 'http://sse.tongji.edu.cn/data/list/$type$';
export default async (ctx) => {
    const {
        type = 'xwdt'
    } = ctx.params;

    const list_url = base_url.replace('$type$', type);
    const {
        data
    } = await got({
        method: 'get',
        url: list_url,
    }); // content is html format
    const $ = cheerio.load(data);

    // get urls
    const detail_urls = [];

    const a = $('ul.data-list').find('a').slice(0, 10);

    for (let i = 0; i < a.length; ++i) {
        const tmp = $(a[i]).attr('href');
        detail_urls.push(tmp);
    }

    // get articles
    const article_list = await Promise.all(detail_urls.map((url) => get_article(url)));

    // feed the data
    ctx.state.data = {
        title: '同济大学软件学院',
        link: list_url,
        item: article_list,
    };
};
