// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const { extractArticle, extractWork } = require('./utils');
import { isValidHost } from '@/utils/valid-host';

export default async (ctx) => {
    const uid = ctx.req.param('uid');
    let pageUrl = `https://www.zcool.com.cn/u/${uid}`;
    if (isNaN(uid)) {
        if (!isValidHost(uid)) {
            throw new Error('Invalid uid');
        }
        pageUrl = `https://${uid}.zcool.com.cn`;
    }
    const { data: response } = await got(pageUrl);
    const $ = load(response);
    const data = JSON.parse($('script#__NEXT_DATA__').text());

    const workList = data.props.pageProps.workList.map((item) => ({
        title: item.title,
        link: item.pageUrl,
        pubDate: parseDate(item.publishTime, 'x'),
        category: [item.objectTypeStr, item.cateStr, item.subCateStr, ...item.tags],
    }));

    const items = await Promise.all(
        workList.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                const data = JSON.parse($('script#__NEXT_DATA__').text());
                if (item.link.startsWith('https://www.zcool.com.cn/article/')) {
                    item.description = extractArticle(data);
                } else if (item.link.startsWith('https://www.zcool.com.cn/work/')) {
                    item.description = extractWork(data);
                }

                return item;
            })
        )
    );

    ctx.set('data', {
        title: data.props.pageProps.seo.title,
        description: data.props.pageProps.seo.description,
        image: data.props.pageProps.userInfo.avatar.includes('?x-oss-process') ? data.props.pageProps.userInfo.avatar.split('?')[0] : data.props.pageProps.userInfo.avatar,
        link: pageUrl,
        item: items,
    });
};
