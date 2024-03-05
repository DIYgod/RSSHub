// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const url = 'https://www.njit.edu.cn/index/tzgg.htm';
const host = 'https://www.njit.edu.cn';

export default async (ctx) => {
    const response = await got({
        method: 'get',
        url,
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = load(response.body);

    const urlList = $('body')
        .find('span.text a')
        .map((i, e) => $(e).attr('href'))
        .get();

    const titleList = $('body')
        .find('span.text a')
        .map((i, e) => $(e).attr('title'))
        .get();

    const dateList = $('body')
        .find('span.date')
        .map((i, e) => '20' + $(e).text().slice(1, 9))
        .get();

    const out = await Promise.all(
        urlList.map((itemUrl, index) => {
            itemUrl = new URL(itemUrl, host).href;
            if (itemUrl.includes('content.jsp')) {
                const single = {
                    title: titleList[index],
                    link: itemUrl,
                    description: '该通知仅限校内访问，请点击原文链接↑',
                    pubDate: parseDate(dateList[index]),
                };
                return single;
            } else {
                return cache.tryGet(itemUrl, async () => {
                    const response = await got({
                        method: 'get',
                        url: itemUrl,
                        https: {
                            rejectUnauthorized: false,
                        },
                    });
                    const $ = load(response.body);
                    const single = {
                        title: $('title').text(),
                        link: itemUrl,
                        description: $('.v_news_content')
                            .html()
                            .replaceAll('src="/', `src="${new URL('.', host).href}`)
                            .replaceAll('href="/', `href="${new URL('.', host).href}`)
                            .trim(),
                        pubDate: parseDate($('.link_1').text().slice(6, 16)),
                    };
                    return single;
                });
            }
        })
    );
    ctx.set('data', {
        title: '南京工程学院 -- 通知公告',
        url,
        item: out,
    });
};
