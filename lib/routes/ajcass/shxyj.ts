import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/shxyj/:year?/:issue?',
    categories: ['journal'],
    example: '/ajcass/shxyj/2024/1',
    parameters: { year: 'Year of the issue, `null` for the lastest', issue: 'Issue number, `null` for the lastest' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '社会学研究',
    maintainers: ['CNYoki'],
    handler,
};

async function handler(ctx) {
    let { year, issue } = ctx.req.param();

    if (!year) {
        const response = await ofetch('https://shxyj.ajcass.com/');
        const $ = load(response);
        const latestIssueText = $('p.hod.pop').first().text();

        const match = latestIssueText.match(/(\d{4}) Vol\.(\d+):/);
        if (match) {
            year = match[1];
            issue = match[2];
        } else {
            throw new Error('无法获取最新的 year 和 issue');
        }
    }

    const url = `https://shxyj.ajcass.com/Magazine/?Year=${year}&Issue=${issue}`;
    const response = await ofetch(url);
    const $ = load(response);

    const items = $('#tab tr')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const articleTitle = $item.find('a').first().text();
            const articleLink = $item.find('a').attr('href');
            const summary = $item.find('li').eq(1).text().replace('[摘要]', '');
            const authors = $item.find('li').eq(2).text().replace('作者：', '');

            if (articleTitle && articleLink) {
                return {
                    title: articleTitle,
                    link: `https://shxyj.ajcass.com${articleLink}`,
                    description: summary,
                    author: authors,
                };
            }
            return null;
        })
        .filter((item) => item !== null);

    return {
        title: `社会学研究 ${year}年第${issue}期`,
        link: url,
        item: items,
    };
}
