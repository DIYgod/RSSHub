import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const host = 'https://jwc.njit.edu.cn';

export const route: Route = {
    path: '/jwc/:type?',
    categories: ['university'],
    example: '/njit/jwc/jx',
    parameters: { type: '默认为 `jx`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '南京工程学院教务处',
    maintainers: ['zefengdaguo'],
    handler,
    description: `| 教学 | 考试 | 信息 | 实践 |
| ---- | ---- | ---- | ---- |
| jx   | ks   | xx   | sj   |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'jx';
    const link = host + '/index/' + type + '.htm';
    const response = await got(link);
    const $ = load(response.body);

    const urlList = $('body')
        .find('ul li span a')
        .map((e) => $(e).attr('href'));

    const titleList = $('body')
        .find('ul li span a')
        .toArray()
        .map((e) => $(e).attr('title'));

    const dateList = $('body')
        .find('span.date')
        .toArray()
        .map((e) => $(e).text());

    const out = await Promise.all(
        urlList.map((itemUrl, index) => {
            itemUrl = new URL(itemUrl, host).href;
            if (itemUrl.includes('.htm')) {
                return cache.tryGet(itemUrl, async () => {
                    const response = await got(itemUrl);
                    if (response.redirectUrls.length !== 0) {
                        const single = {
                            title: titleList[index],
                            link: itemUrl,
                            description: '该通知无法直接预览, 请点击原文链接↑查看',
                            pubDate: parseDate(dateList[index]),
                        };
                        return single;
                    }
                    const $ = load(response.body);
                    const single = {
                        title: $('title').text(),
                        link: itemUrl,
                        description: $('.v_news_content')
                            .html()
                            .replaceAll('src="/', `src="${new URL('.', host).href}`)
                            .replaceAll('href="/', `href="${new URL('.', host).href}`)
                            .trim(),
                        pubDate: $('.author p').eq(1).text().replace('时间:', ''),
                    };
                    return single;
                });
            } else {
                const single = {
                    title: titleList[index],
                    link: itemUrl,
                    description: '该通知为文件，请点击原文链接↑下载',
                    pubDate: parseDate(dateList[index]),
                };
                return single;
            }
        })
    );
    let info;
    switch (type) {
        case 'ks':
            info = '考试';

            break;

        case 'xx':
            info = '信息';

            break;

        case 'sj':
            info = '实践';

            break;

        case 'jx':
        default:
            info = '教学';
            break;
    }
    return {
        title: '南京工程学院教务处 -- ' + info,
        link,
        item: out,
    };
}
