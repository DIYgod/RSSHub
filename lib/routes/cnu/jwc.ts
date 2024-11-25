import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';
import { load } from 'cheerio';

const BASE_URL = 'https://jwc.cnu.edu.cn/tzgg/index.htm';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/cnu/jwc',
    radar: [
        {
            source: [BASE_URL],
        },
    ],
    name: '首都师范大学教务处',
    maintainers: ['Aicnal'],
    handler,
    url: BASE_URL,
};

async function handler() {
    const response = await got({ method: 'get', url: BASE_URL });
    const $ = load(response.data);

    const list = $('li')
        .map((i, e) => {
            const element = $(e);
            const rawTitle = element.find('a').text().trim();
            const dateRegex = /^(\d{1,2})\s+(\d{4})-(\d{1,2})/;
            const match = rawTitle.match(dateRegex);

            if (!match) {return null;}

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
        .toArray()
        .filter(Boolean);

    const items = await Promise.all(
        list.map(async (item) => {
            try {
                const detailResponse = await got({ method: 'get', url: item.link });
                const content = load(detailResponse.data);
                const paragraphs = content('body p')
                    .filter((_, el) => {
                        const text = content(el).text();
                        return !/分享到：|版权所有|地址：|E-mail:|网站地图|ICP备|京公网安备/.test(text);
                    })
                    .map((_, el) => {
                        content(el).find('img').remove(); // 移除 <img> 标签
                        return content(el).html()?.trim();
                    })
                    .toArray()
                    .join('<br/><br/>');

                return {
                    ...item,
                    description: paragraphs || '暂无内容',
                };
            } catch (error) {
                return {
                    ...item,
                    description: `内容获取失败: ${error.message}`,
                };
            }
        })
    );

    return {
        title: '首都师范大学教务信息',
        link: BASE_URL,
        description: '首都师范大学教务处的最新通知公告',
        item: items,
    };
}
