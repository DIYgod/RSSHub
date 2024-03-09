import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const base_url = 'https://jw.dhu.edu.cn';

const map = {
    student: '/tzggwxszl/list.htm',
    teacher: '/tzggwjszl/list.htm',
};
export const route: Route = {
    path: '/jiaowu/news/:type?',
    categories: ['university'],
    example: '/dhu/jiaowu/news/student',
    parameters: { type: '默认为 `student`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '教务处通知',
    maintainers: ['KiraKiseki'],
    handler,
    description: `| 学生专栏 | 教师专栏 |
  | -------- | -------- |
  | student  | teacher  |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const link = Object.hasOwn(map, type) ? `${base_url}${map[type]}` : `${base_url}/tzggwxszl/list.htm`;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: base_url,
        },
    });

    const $ = load(response.data);
    return {
        link: base_url,
        title: '东华大学教务处-' + $('.col_title').text(),
        item: $('.list_item')
            .map((_, elem) => ({
                link: new URL($('a', elem).attr('href'), base_url),
                title: $('a', elem).attr('title'),
                pubDate: timezone(parseDate($('.Article_PublishDate', elem).text()), +8),
            }))
            .get(),
    };
}
