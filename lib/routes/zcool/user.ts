import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { isValidHost } from '@/utils/valid-host';

import { extractArticle, extractWork } from './utils';

export const route: Route = {
    path: '/user/:uid',
    categories: ['design'],
    view: ViewType.Pictures,
    example: '/zcool/user/baiyong',
    parameters: { uid: '个性域名前缀或者用户ID' },
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
            source: ['www.zcool.com.cn/u/:id'],
            target: '/user/:id',
        },
    ],
    name: '用户作品',
    description: `例如:

站酷的个人主页 \`https://baiyong.zcool.com.cn\` 对应 rss 路径 \`/zcool/user/baiyong\`

站酷的个人主页 \`https://www.zcool.com.cn/u/568339\` 对应 rss 路径 \`/zcool/user/568339\``,
    maintainers: ['junbaor'],
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    let pageUrl = `https://www.zcool.com.cn/u/${uid}`;
    if (Number.isNaN(Number(uid))) {
        if (!isValidHost(uid)) {
            throw new InvalidParameterError('Invalid uid');
        }
        pageUrl = `https://${uid}.zcool.com.cn`;
    }
    const { data: response } = await got(pageUrl);
    const $ = load(response);
    const data = JSON.parse($('script#__NEXT_DATA__').text());

    const workList = data.props.pageProps.workList.map((item) => ({
        title: item.title,
        link: item.pageUrl,
        pubDate: [undefined, null, ''].includes(item.publishTime) ? undefined : parseDate(item.publishTime, 'x'),
        category: [item.objectTypeStr, item.cateStr, item.subCateStr, ...item.tags],
    }));

    const items = await Promise.all(
        workList.map(async (item) => {
            const detail = await cache.tryGet(`zcool:user:${item.link}:description`, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                const data = JSON.parse($('script#__NEXT_DATA__').text());
                let description;
                if (item.link.startsWith('https://www.zcool.com.cn/article/')) {
                    description = extractArticle(data);
                } else if (item.link.startsWith('https://www.zcool.com.cn/work/')) {
                    description = extractWork(data);
                }

                return { description };
            });
            return { ...item, ...detail };
        })
    );

    return {
        title: data.props.pageProps.seo.title,
        description: data.props.pageProps.seo.description,
        image: data.props.pageProps.userInfo.avatar.includes('?x-oss-process') ? data.props.pageProps.userInfo.avatar.split('?', 1)[0] : data.props.pageProps.userInfo.avatar,
        link: pageUrl,
        item: items,
    };
}
