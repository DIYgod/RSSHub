import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { extractArticle, extractWork } from './utils';
const baseUrl = 'https://www.zcool.com.cn';

export const route: Route = {
    path: '/top/:type',
    categories: ['design'],
    view: ViewType.Pictures,
    example: '/zcool/top/design',
    parameters: {
        type: {
            description: '推荐类型',
            options: [
                { value: 'design', label: '作品榜单' },
                { value: 'article', label: '文章榜单' },
            ],
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '作品总榜单',
    maintainers: ['yuuow'],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const url = `${baseUrl}/top/${type === 'design' ? 'index.do' : 'article.do?rankType=8'}`;

    const { data: response } = await got(url);

    const $ = load(response);

    const data = JSON.parse($('script#__NEXT_DATA__').text());

    const list = data.props.pageProps.listResult.data.map((item) => ({
        title: item.rankingTitle,
        author: item.member.name,
        category: [item.productCategoryStr, item.productSubCateStr, ...item.tags],
        link: item.pageUrl,
        pubDate: parseDate(item.rankingPublishTime),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                const data = JSON.parse($('script#__NEXT_DATA__').text());
                item.pubDate = parseDate(data.props.pageProps.data.publishTime, 'x');

                if (item.link.startsWith('https://www.zcool.com.cn/article/')) {
                    item.description = extractArticle(data);
                } else if (item.link.startsWith('https://www.zcool.com.cn/work/')) {
                    item.description = extractWork(data);
                }

                return item;
            })
        )
    );

    return {
        title: data.props.pageProps.seo.title,
        description: data.props.pageProps.seo.description,
        link: url,
        item: items,
    };
}
