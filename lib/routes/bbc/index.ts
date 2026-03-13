import type { Route } from '@/types';
import cache from '@/utils/cache';
import parser from '@/utils/rss-parser';

import { fetchBbcContent } from './utils';

export const route: Route = {
    path: '/:site?/:channel?',
    name: 'News',
    maintainers: ['HenryQW', 'DIYgod', 'pseudoyu'],
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
        feed.items
            .filter((item) => item && item.link)
            .map((item) => {
                const link = item.link.split('?')[0];
                return {
                    ...item,
                    // https://www.bbc.co.uk/zhongwen/simp/index.xml returns trad regardless of lang parameter
                    // which requires manual fixing
                    link: site === 'chinese' ? item.link.replace('/trad', '/simp') : link,
                };
            })
            .map((item) =>
                cache.tryGet(item.link, async () => {
                    const linkURL = new URL(item.link);
                    if (linkURL.hostname === 'www.bbc.com') {
                        linkURL.hostname = 'www.bbc.co.uk';
                    }

                    const { category, description } = await fetchBbcContent(linkURL.href, item);

                    return {
                        title: item.title || '',
                        description: description || '',
                        pubDate: item.pubDate,
                        link: item.link,
                        category: category ?? item.categories ?? [],
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
