import { Route } from '@/types';
import got from '@/utils/got';
import utils from './utils';
const getLinkAndTitle = (type, period) => {
    const baseURL = 'https://api.coolapk.com/v6/page/dataList?url=';
    let link;
    const res = {};
    const types = {
        jrrm: {
            title: '今日热门',
            url: baseURL + '%2Ffeed%2FstatList%3FcacheExpires%3D300%26statType%3Dday%26sortField%3Ddetailnum%26title%3D%E4%BB%8A%E6%97%A5%E7%83%AD%E9%97%A8&title=%E4%BB%8A%E6%97%A5%E7%83%AD%E9%97%A8&subTitle=&page=1',
        },

        dzb: {
            title: '点赞榜',
            sortField: 'likenum',
        },

        scb: {
            title: '收藏榜',
            sortField: 'favnum',
        },
        plb: {
            title: '评论榜',
            sortField: 'replynum',
        },
        ktb: {
            title: '酷图榜',
            sortField: 'likenum',
        },
    };

    const periods = {
        daily: {
            description: '日榜',
            statType: 'day',
        },
        weekly: {
            description: '周榜',
            statType: '7days',
        },
    };

    if (type === 'jrrm') {
        res.link = types.jrrm.url;
        res.title = types.jrrm.title;
        return res;
    } else if (type === 'ktb') {
        const trans = {
            daily: {
                description: '周榜',
                statDays: '7days',
            },
            weekly: {
                description: '月榜',
                statDays: '30days',
            },
        };
        link = `#/feed/coolPictureList?statDays=` + trans[period].statDays + `&listType=statFavNum&buildCard=1&title=` + trans[period].description + `&page=1`;
        res.title = '酷图榜-' + trans[period].description;
    } else {
        link = `#/feed/statList?statType=` + periods[period].statType + `&sortField=` + types[type].sortField + `&title=` + periods[period].description + `&page=1`;
        res.title = types[type].title + `-` + periods[period].description;
    }
    res.link = baseURL + encodeURIComponent(link);
    return res;
};

export const route: Route = {
    path: '/hot/:type?/:period?',
    categories: ['social-media'],
    example: '/coolapk/hot',
    parameters: { type: '默认为`jrrm`', period: '默认为`daily`' },
    features: {
        requireConfig: [
            {
                name: 'ALLOW_USER_HOTLINK_TEMPLATE',
                optional: true,
                description: '设置为`true`并添加`image_hotlink_template`参数来代理图片',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '热榜',
    maintainers: ['xizeyoupan'],
    handler,
    description: `| 参数名称 | 今日热门 | 点赞榜 | 评论榜 | 收藏榜 | 酷图榜 |
| -------- | -------- | ------ | ------ | ------ | ------ |
| type     | jrrm     | dzb    | plb    | scb    | ktb    |

| 参数名称 | 日榜  | 周榜   |
| -------- | ----- | ------ |
| period   | daily | weekly |

::: tip
  今日热门没有周榜，酷图榜日榜的参数会变成周榜，周榜的参数会变成月榜。
:::`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') || 'jrrm';
    const period = ctx.req.param('period') || 'daily';
    const { link, title } = getLinkAndTitle(type, period);
    const r = await got(link, {
        headers: utils.getHeaders(),
    });
    const data = r.data.data;
    const t = [];
    for (const i of data) {
        if (i.entityType === 'card') {
            for (const k of i.entities) {
                t.push(k);
            }
        } else {
            t.push(i);
        }
    }

    let out = await Promise.all(t.map((item) => utils.parseDynamic(item)));

    out = out.filter(Boolean);

    return {
        title,
        link: 'https://www.coolapk.com/',
        description: `热榜-` + title,
        item: out,
    };
}
