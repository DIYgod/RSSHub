import { Route } from '@/types';
import util from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/dc/:type',
    categories: ['university'],
    example: '/nua/dc/news',
    parameters: { type: 'News Type' },
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
            source: ['dc.nua.edu.cn/:type/list.htm'],
        },
    ],
    name: 'School of Design',
    maintainers: ['evnydd0sf'],
    handler,
    description: `| News Type                | Parameters |
| ------------------------ | ---------- |
| 学院新闻 NEWS            | news       |
| 展览 EXHIBITION          | exhibition |
| 研创 RESEARCH & CREATION | rc         |
| 项目 PROJECT             | project    |
| 党团 PARTY               | party      |
| 后浪 YOUTH               | youth      |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');

    const baseUrl = 'https://dc.nua.edu.cn';

    let listName;
    let listDate;
    let artiContent;
    let webPageName;

    switch (type) {
        case 'news':
            listName = 'li.pre35.left li.news_list';
            listDate = '.date';
            artiContent = '.article';
            webPageName = 'li.pre35.left .big_title';
            break;
        case 'exhibition':
            listName = 'li.pre65.right li.effects';
            listDate = '.date';
            artiContent = '.article';
            webPageName = 'li.pre65.right .big_title';
            break;
        case 'project':
            listName = 'ul.center div.center_list_img';
            listDate = '.date';
            artiContent = '.article';
            webPageName = 'ul.center .big_title';
            break;
        case 'rc':
            listName = 'div.pre65.left p.small_content_2';
            listDate = '.date';
            artiContent = '.article';
            webPageName = 'div.pre65.left.is-inview .big_title';
            break;
        case 'party':
            listName = 'div.pre35.right li.party_list';
            listDate = '.date';
            artiContent = '.article';
            webPageName = 'div.pre35.right .big_title';
            break;
        case 'youth':
            listName = 'ul.works_list p.small_content_2.viewpoint';
            listDate = '.date';
            artiContent = '.article';
            webPageName = 'ul.screen_4 .big_title';
            break;
        default:
            throw new InvalidParameterError(`暂不支持对${type}的订阅`);
    }

    const items = await util.ProcessList(baseUrl, baseUrl, listName, listDate, webPageName);
    const results = await util.ProcessFeed(items[0], artiContent);

    return {
        title: 'NUA-设计学院-' + items[1],
        link: baseUrl,
        description: '南京艺术学院 设计学院 ' + items[1],
        item: results,
    };
}
