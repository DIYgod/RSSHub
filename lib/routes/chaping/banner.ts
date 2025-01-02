import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/banner',
    categories: ['new-media', 'popular'],
    example: '/chaping/banner',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['chaping.cn/'],
        },
    ],
    name: '图片墙',
    maintainers: ['nczitzk'],
    handler,
    url: 'chaping.cn/',
};

async function handler() {
    const rootUrl = `https://chaping.cn/`;
    const response = await got({
        method: 'get',
        url: rootUrl,
    });
    const data = JSON.parse(response.data.match(/"bannerList":(.*?),"menu":/)[1]);

    const bannerList = data.map((item) => ({
        title: item.news_title,
        link: `https://chaping.cn/news/${item.news_id}`,
    }));

    const items = await Promise.all(
        bannerList.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = JSON.parse(detailResponse.data.match(/"current":(.*?),"optionsList":/)[1]);

                item.description = content.content;
                item.author = content.article_author.name;
                item.pubDate = parseDate(content.time_publish_timestamp * 1000);

                return item;
            })
        )
    );

    return {
        title: '差评 - 首页图片墙',
        link: rootUrl,
        item: items,
    };
}
