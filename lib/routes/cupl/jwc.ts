import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';
import { isOnSite } from '@/utils/valid-host';

const rootUrl = 'https://jwc.cupl.edu.cn';
const targetUrl = `${rootUrl}/tz/tzgg.htm`;

export const route: Route = {
    path: '/jwc',
    url: 'jwc.cupl.edu.cn/tz/tzgg.htm',
    categories: ['university'],
    example: '/cupl/jwc',
    description: '中国政法大学教务处通知公告',
    name: '教务处通知公告',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['jwc.cupl.edu.cn/tz/tzgg.htm', 'jwc.cupl.edu.cn/'],
            target: '/jwc',
        },
    ],
    maintainers: ['Fgju'],
    handler: async () => {
        const challenge = await ofetch.raw<string>(targetUrl, { headers: { 'user-agent': config.ua } });
        const lbCookie = challenge.headers.getSetCookie()[0].split(';', 1)[0];
        const { client_id: clientId } = await ofetch(`${rootUrl}/dynamic_challenge`, {
            method: 'POST',
            headers: { 'user-agent': config.ua, cookie: lbCookie },
            body: {
                challenge_id: challenge._data!.match(/challengeId = "(.*?)"/)?.[1],
                answer: Number(challenge._data!.match(/answer = (\d+)/)?.[1]),
                browser_info: {},
            },
        });
        const headers = { 'user-agent': config.ua, cookie: `${lbCookie}; client_id=${clientId}` };

        const listHtml = await ofetch(targetUrl, { headers });
        const $ = load(listHtml);
        const list = $('li[id^="line_u7_"]')
            .toArray()
            .map((el) => {
                const element = $(el);
                const href = element.find('a').attr('href');
                const date = `${element.find('time em').text()}-${element.find('time span').text()}`;

                return {
                    link: href ? new URL(href, targetUrl).href : undefined,
                    title: element.find('h3').text(),
                    pubDate: parseDate(date, 'YYYY-MM-DD', 8),
                    description: element.find('.txt p').html(),
                };
            })
            .filter((item) => item.link);

        const items = await pMap(
            list,
            (item) =>
                // only follow links on the site itself
                isOnSite(item.link, 'cupl.edu.cn')
                    ? cache.tryGet(item.link!, async () => {
                          const detailHtml = await ofetch(item.link!, { headers });
                          const $ = load(detailHtml);
                          const attachments = $('.detail > .txt a[href*="download.jsp"]')
                              .toArray()
                              .map((el) => `<li>${$.html(el)}</li>`);

                          return {
                              ...item,
                              description: `${$('.v_news_content').html() ?? ''}${attachments.length ? `<ul>${attachments.join('')}</ul>` : ''}`,
                          };
                      })
                    : item,
            { concurrency: 1 }
        );

        return {
            title: '通知公告',
            link: targetUrl,
            description: '中国政法大学教务处通知公告',
            language: 'zh-CN',
            item: items,
        };
    },
};
