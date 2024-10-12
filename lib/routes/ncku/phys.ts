import type { Route } from '@/types';
import { CheerioAPI, load } from 'cheerio';
import ofetch from '@/utils/ofetch';

const currentURL = (catagory: string) => `https://phys.ncku.edu.tw/news/${catagory === '_all' ? '' : catagory}`;

const catagories = {
    '24': '物理系',
    scholarship: '獎助學金',
    admission: '招生與錄取報到',
    'course-announcement': '助教公告',
    'bachelor-announcement': '大學部',
    'master-announcement': '研究所',
    graduation: '畢業離校',
    'student-guide': '學生手冊與新生入學',
    honor: '榮譽榜',
    career: '求才公告',
    others: '其他',
    _all: '所有訊息',
};

export const route: Route = {
    'zh-TW': {
        name: '國立成功大學物理系公告',
    },
    name: 'Phys News',
    description: `| 分類 | catagory |
| 物理系 | 24 |
| 獎助學金 | scholarship |
| 招生與錄取報到 | admission |
| 助教公告 | course-announcement |
| 大學部 | bachelor-announcement |
| 研究所 | master-announcement |
| 畢業離校 | graduation |
| 學生手冊與新生入學 | student-guide |
| 榮譽榜 | honor |
| 求才公告 | career |
| 其他 | others |
| 所有訊息 | _all |
`,
    path: '/phys/:catagory?',
    parameters: {
        catagory: 'catagory, default is _all',
    },
    categories: ['university'],
    example: '/ncku/phys/_all',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['phys.ncku.edu.tw/news/'],
            target: '/phys/_all',
        },
        {
            source: ['phys.ncku.edu.tw/news/:catagory/'],
            target: '/phys/:catagory',
        },
    ],
    maintainers: ['simbafs'],
    handler: async (ctx) => {
        let catagory = ctx.req.param('catagory') ?? '_all';
        if (catagories[catagory] === undefined) {
            catagory = '_all';
        }

        const $ = await ofetch<CheerioAPI>(currentURL(catagory), {
            parseResponse: load,
        });

        const item = $('.newsList .Txt')
            .toArray()
            .map((e) => ({
                title: $('a', e).text(),
                pubDate: new Date(
                    $('.newsDate', e)
                        .text()
                        .match(/\d{4}(?: \/ \d{2}){2}/)?.[0] || ''
                ),
                link: $('a', e).attr('href'),
                catagory: $('.newIcon', e).text(),
            }));

        return {
            title: `成大物理系公告 - ${catagories[catagory]}`,
            link: currentURL(catagory),
            item,
        };
    },
};
