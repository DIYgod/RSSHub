import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';
import { load } from 'cheerio';
import cache from '@/utils/cache';

const BASE_URL = 'https://jwc.cnu.edu.cn/tzgg/index.htm';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/cnu/jwc',
    radar: [
        {
            source: [new URL(BASE_URL).host],
        },
    ],
    name: '教务处', // Name of the route
    maintainers: ['Aicnal'],
    handler,
    url: new URL(BASE_URL).host + new URL(BASE_URL).pathname, // host + pathname
};

async function handler() {
    const response = await got({ method: 'get', url: BASE_URL });
    const $ = load(response.data);

    const list = $('li')
        .toArray() // Convert to an array first
        .map((e) => {
            const element = $(e);
            const rawTitle = element.find('a').text().trim();
            const dateRegex = /^(\d{1,2})\s+(\d{4})-(\d{1,2})/;
            const match = rawTitle.match(dateRegex);

            if (!match) {
                return null;
            }

            const [, day, year, month] = match;
            const pubDate = parseDate(`${year}-${month}-${day}`, 'YYYY-MM-DD');
            const title = rawTitle
                .replace(dateRegex, '')
                .trim()
                .replaceAll(/(公众|教师|学生)/g, '')
                .trim();
            const href = element.find('a').attr('href') ?? '';
            const link = href.startsWith('http') ? href : new URL(href, BASE_URL).href;

            return { title, link, pubDate };
        })
        .filter(Boolean);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                // Cache the detail page
                const detailResponse = await got({ method: 'get', url: item.link });
                const content = load(detailResponse.data);
                const paragraphs = content('.article02') // with `.article02`
                    .toArray()
                    .map((el) => content(el).html()?.trim())
                    .join('<br/><br/>');

                return {
                    ...item,
                    description: paragraphs || '暂无内容',
                };
            })
        )
    );

    return {
        title: '首都师范大学教务信息',
        link: BASE_URL,
        description: '首都师范大学教务处的最新通知公告',
        item: items,
    };
}
