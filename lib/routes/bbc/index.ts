// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import parser from '@/utils/rss-parser';
import { load } from 'cheerio';
const utils = require('./utils');

export default async (ctx) => {
    let feed, title, link;

    // 为了向下兼容，这里 site 对应的是中文网文档中的 lang，英文网文档中的 channel
    // 英文网不会用到 channel
    const { site, channel } = ctx.req.param();

    if (site) {
        switch (site.toLowerCase()) {
            case 'chinese':
                title = 'BBC News 中文网';

                feed = await (channel ? parser.parseURL(`https://www.bbc.co.uk/zhongwen/simp/${channel}/index.xml`) : parser.parseURL('https://www.bbc.co.uk/zhongwen/simp/index.xml'));
                break;

            case 'traditionalchinese':
                title = 'BBC News 中文網';

                feed = await (channel ? parser.parseURL(`https://www.bbc.co.uk/zhongwen/trad/${channel}/index.xml`) : parser.parseURL('https://www.bbc.co.uk/zhongwen/trad/index.xml'));
                link = 'https://www.bbc.com/zhongwen/trad';
                break;

            // default to bbc.com
            default:
                feed = await parser.parseURL(`https://feeds.bbci.co.uk/news/${site.split('-').join('/')}/rss.xml`);
                title = `BBC News ${site}`;
                link = `https://www.bbc.co.uk/news/${site.split('-').join('/')}`;
                break;
        }
    } else {
        feed = await parser.parseURL('https://feeds.bbci.co.uk/news/rss.xml');
        title = 'BBC News Top Stories';
        link = 'https://www.bbc.co.uk/news';
    }

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = load(response.data);

                const description = response.request.options.url.pathname.startsWith('/news/av') ? item.content : utils.ProcessFeed($);

                let section = 'sport';
                const urlSplit = item.link.split('/');
                const sectionSplit = urlSplit.at(-1).split('-');
                if (sectionSplit.length > 1) {
                    section = sectionSplit[0];
                }
                section = section[0].toUpperCase() + section.slice(1);

                return {
                    title: `[${section}] ${item.title}`,
                    description,
                    pubDate: item.pubDate,
                    link: item.link,
                };
            })
        )
    );

    ctx.set('data', {
        title,
        link,
        image: 'https://www.bbc.com/favicon.ico',
        description: title,
        item: items,
    });
};
