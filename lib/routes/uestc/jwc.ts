import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const dateRegex = /(20\d{2})\/(\d{2})\/(\d{2})/;

const baseUrl = 'https://www.jwc.uestc.edu.cn/';
const detailUrl = 'https://www.jwc.uestc.edu.cn/info/';

const map = {
    important: 'hard/?page=1',
    student: 'list/256/?page=1',
    teacher: 'list/255/?page=1',
    teach: 'list/40/?page=1',
    office: 'list/ff80808160bcf79c0160c010a8d20020/?page=1',
};

export const route: Route = {
    path: '/jwc/:type?',
    categories: ['university'],
    example: '/uestc/jwc/student',
    parameters: { type: '默认为 `important`' },
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
            source: ['jwc.uestc.edu.cn/'],
            target: '/jwc',
        },
    ],
    name: '教务处',
    maintainers: ['achjqz', 'mobyw'],
    handler,
    url: 'jwc.uestc.edu.cn/',
    description: `| 重要公告  | 学生事务公告 | 教师事务公告 | 教学新闻 | 办公室 |
  | --------- | ------------ | ------------ | -------- | ------ |
  | important | student      | teacher      | teach    | office |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') || 'important';
    const pageUrl = map[type];
    if (!pageUrl) {
        throw new InvalidParameterError('type not supported');
    }

    const response = await got.get(baseUrl + pageUrl);

    const $ = load(response.data);

    const items = $('div.textAreo.clearfix');

    const out = $(items)
        .map((_, item) => {
            item = $(item);
            const newsTitle = item.find('a').attr('title');
            const newsLink = detailUrl + item.find('a').attr('newsid');
            const newsDate = parseDate(item.find('i').text().replace(dateRegex, '$1-$2-$3'));

            return {
                title: newsTitle,
                link: newsLink,
                pubDate: newsDate,
            };
        })
        .get();

    return {
        title: '教务处通知',
        link: baseUrl,
        description: '电子科技大学教务处通知',
        item: out,
    };
}
