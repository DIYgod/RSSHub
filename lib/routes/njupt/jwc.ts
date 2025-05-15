import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const host = 'https://jwc.njupt.edu.cn';

const map = {
    notice: '/1594',
    news: '/1596',
};

export const route: Route = {
    path: '/jwc/:type?',
    categories: ['university'],
    example: '/njupt/jwc/notice',
    parameters: { type: '默认为 `notice`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '教务处通知与新闻',
    maintainers: ['shaoye'],
    handler,
    description: `| 通知公告 | 教务快讯 |
| -------- | -------- |
| notice   | news     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'notice';
    const link = host + map[type] + '/list.htm';
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: host,
        },
    });
    const $ = load(response.data);

    const urlList = $('.content')
        .find('a')
        .slice(0, 10)
        .toArray()
        .map((e) => $(e).attr('href'));

    const titleList = $('.content')
        .find('a')
        .slice(0, 10)
        .toArray()
        .map((e) => $(e).attr('title'));

    const dateList = $('.content tr')
        .find('div')
        .slice(0, 10)
        .toArray()
        .map((e) => $(e).text().replace('发布时间：', ''));

    const out = await Promise.all(
        urlList.map((itemUrl, index) => {
            itemUrl = new URL(itemUrl, host).href;
            if (itemUrl.includes('.htm')) {
                return cache.tryGet(itemUrl, async () => {
                    const response = await got.get(itemUrl);
                    if (response.redirectUrls.length !== 0) {
                        const single = {
                            title: titleList[index],
                            link: itemUrl,
                            description: '该通知无法直接预览, 请点击原文链接↑查看',
                            pubDate: parseDate(dateList[index]),
                        };
                        return single;
                    }
                    const $ = load(response.data);
                    const single = {
                        title: $('.Article_Title').text(),
                        link: itemUrl,
                        description: $('.wp_articlecontent')
                            .html()
                            .replaceAll('src="/', `src="${new URL('.', host).href}`)
                            .replaceAll('href="/', `href="${new URL('.', host).href}`)
                            .trim(),
                        pubDate: parseDate($('.Article_PublishDate').text().replace('发布时间：', '')),
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
    let info = '通知公告';
    if (type === 'news') {
        info = '教务快讯';
    }
    return {
        title: '南京邮电大学 -- ' + info,
        link,
        item: out,
    };
}
