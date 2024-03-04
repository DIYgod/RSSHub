// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const categories = {
    nba: {
        title: 'NBA',
        data: 'newsData',
    },
    cba: {
        title: 'CBA',
        data: 'newsData',
    },
    soccer: {
        title: '足球',
        data: 'news',
    },
};

export default async (ctx) => {
    const category = ctx.req.param('category') ?? 'soccer';

    const rootUrl = 'https://m.hupu.com';
    const currentUrl = `${rootUrl}/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const data = JSON.parse(response.data.match(/"props":(.*),"page":"\//)[1]);

    let items = data.pageProps[categories[category].data].map((item) => ({
        title: item.title,
        pubDate: timezone(parseDate(item.publishTime), +8),
        link: item.link.replace(/bbs\.hupu.com/, 'm.hupu.com/bbs'),
    }));

    items = await Promise.all(
        items
            .filter((item) => !/subject/.test(item.link))
            .map((item) =>
                cache.tryGet(item.link, async () => {
                    try {
                        const detailResponse = await got({
                            method: 'get',
                            url: item.link,
                        });

                        const content = load(detailResponse.data);

                        item.author = content('.bbs-user-info-name, .bbs-user-wrapper-content-name-span').text();
                        item.category = content('.basketballTobbs_tag > a, .tag-player-team')
                            .toArray()
                            .map((c) => content(c).text());

                        content('.basketballTobbs_tag').remove();
                        content('.hupu-img').each(function () {
                            content(this)
                                .parent()
                                .html(`<img src="${content(this).attr('data-origin')}">`);
                        });

                        item.description = content('#bbs-thread-content, .bbs-content-font').html();
                    } catch {
                        // no-empty
                    }

                    return item;
                })
            )
    );

    ctx.set('data', {
        title: `虎扑 - ${categories[category].title}`,
        link: currentUrl,
        item: items,
    });
};
