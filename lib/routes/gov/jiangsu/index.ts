import { load } from 'cheerio';
import { decodeHTML } from 'entities';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const homePage = 'http://www.jiangsu.gov.cn';

const categories = {
    'executive-meeting': 33716,
    'important-news': 60096,
    department: 60085,
    'city-county': 33718,
    documentation: 84242,
    'policy-interpretation': 32648,
    'normative-document': 66109,
    'legislative-opinion-collection': 69933,
    'opinion-collection': 83435,
    'information-publicity': 84258,
};

export const route: Route = {
    path: '/:category',
    categories: ['government'],
    example: '/gov/jiangsu/important-news',
    parameters: { category: '分类名，见下表' },
    name: '动态',
    maintainers: ['ocleo1'],
    description: `|   省政府常务会议  |    要闻关注    |  部门资讯  |   地方动态  |        政策解读       |
| :---------------: | :------------: | :--------: | :---------: | :-------------------: |
| executive-meeting | important-news | department | city-county | policy-interpretation |

|    政府信息公开制度   |    政策文件   |     规范性文件     |
| :-------------------: | :-----------: | :----------------: |
| information-publicity | documentation | normative-document |

|          立法意见征集          |      征集调查      |
| :----------------------------: | :----------------: |
| legislative-opinion-collection | opinion-collection |`,
    handler,
};

async function handler(ctx: Context) {
    const { category } = ctx.req.param();

    const target = categories[category];
    if (!target) {
        throw new InvalidParameterError('Jiangsu, Cannot find page');
    }

    const link = `${homePage}/col/col${target}/index.html`;
    const response = await ofetch(link);
    const html = response.includes('<record>') ? response : decodeHTML(response);
    const records = html
        .matchAll(/<record>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/record>/g)
        .toArray()
        .map((match) => match[1]);

    const item = records.map((record) => {
        const $item = load(record)('li');
        const $aTag = $item.find('a').first();
        const date = $item
            .text()
            .replaceAll(/\s/g, '')
            .match(/\d{4}-\d{2}-\d{2}/);

        return {
            title: $aTag.text().trim(),
            description: $aTag.attr('title'),
            pubDate: date ? timezone(parseDate(date[0]), 8) : undefined,
            link: new URL($aTag.attr('href')!, link).href,
        };
    });

    const $ = load(response);
    const [siteName, categoryName] = $('head title').text().split(' ', 2);

    return {
        title: categoryName,
        link,
        description: `${categoryName} - ${siteName}`,
        item,
    };
}
