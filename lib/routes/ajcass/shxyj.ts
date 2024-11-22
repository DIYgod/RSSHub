import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

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
        const response = await got('https://shxyj.ajcass.com/');
        const $ = load(response.body);
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
    const response = await got(url);
    const $ = load(response.body);

    const items = $('#tab tr')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const articleTitle = $item.find('a').first().text().trim();
            const articleLink = $item.find('a').first().attr('href');
            const summary = $item.find('li').eq(1).text().replace('[摘要]', '').trim();
            const authors = $item.find('li').eq(2).text().replace('作者：', '').trim();
            const pubDate = parseDate(`${year}-${Number.parseInt(issue) * 2}`);

            if (articleTitle && articleLink) {
                return {
                    title: articleTitle,
                    link: `https://shxyj.ajcass.com${articleLink}`,
                    description: summary,
                    author: authors,
                    pubDate,
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
