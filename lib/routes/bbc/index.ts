import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import parser from '@/utils/rss-parser';
import { load } from 'cheerio';
import utils from './utils';

export const route: Route = {
    path: '/:site?/:channel?',
    name: 'News',
    maintainers: ['HenryQW', 'DIYgod'],
    handler,
    example: '/bbc/world-asia',
    parameters: {
        site: '语言，简体或繁体中文',
        channel: 'channel, default to `top stories`',
    },
    categories: ['traditional-media'],
    description: `Provides a better reading experience (full text articles) over the official ones.

    Support major channels, refer to [BBC RSS feeds](https://www.bbc.co.uk/news/10628494). Eg, \`business\` for \`https://feeds.bbci.co.uk/news/business/rss.xml\`.

    -   Channel contains sub-directories, such as \`https://feeds.bbci.co.uk/news/world/asia/rss.xml\`, replace \`/\` with \`-\`, \`/bbc/world-asia\`.`,
};

async function handler(ctx) {
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

    return {
        title,
        link,
        image: 'https://www.bbc.com/favicon.ico',
        description: title,
        item: items,
    };
}
