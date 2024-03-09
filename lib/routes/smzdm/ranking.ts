import { Route } from '@/types';
import got from '@/utils/got';
import timezone from '@/utils/timezone';

const getTrueHour = (rank_type, rank_id, hour) => {
    const rank_two_hour = ['11', '17', '28', '29'];
    const rank_four_hour = ['12', '13', '14', '15', '17', '74', '75', '71', '25'];
    const flag = ['pinlei', 'dianshang'].includes(rank_type) && [...rank_two_hour, ...rank_four_hour].includes(rank_id) && hour === '3';
    if (flag) {
        return rank_two_hour.includes(rank_id) ? '2' : '4';
    } else {
        return hour;
    }
};

export const route: Route = {
    path: '/ranking/:rank_type/:rank_id/:hour',
    categories: ['shopping'],
    example: '/smzdm/ranking/pinlei/11/3',
    parameters: { rank_type: '榜单类型', rank_id: '榜单ID', hour: '时间跨度' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '排行榜',
    maintainers: ['DIYgod'],
    handler,
    description: `-   榜单类型

  | 好价品类榜 | 好价电商榜 | 海淘 TOP 榜 | 好文排行榜 | 好物排行榜 |
  | ---------- | ---------- | ----------- | ---------- | ---------- |
  | pinlei     | dianshang  | haitao      | haowen     | haowu      |

  -   榜单 ID

  好价品类榜

  | 全部 | 食品生鲜 | 电脑数码 | 运动户外 | 家用电器 | 白菜 | 服饰鞋包 | 日用百货 |
  | ---- | -------- | -------- | -------- | -------- | ---- | -------- | -------- |
  | 11   | 12       | 13       | 14       | 15       | 17   | 74       | 75       |

  好价电商榜

  | 券活动 | 京东 | 天猫 | 亚马逊中国 | 国美在线 | 苏宁易购 | 网易 | 西集网 | 美国亚马逊 | 日本亚马逊 | ebay |
  | ------ | ---- | ---- | ---------- | -------- | -------- | ---- | ------ | ---------- | ---------- | ---- |
  | 24     | 23   | 25   | 26         | 27       | 28       | 29   | 30     | 31         | 32         | 33   |

  海淘 TOP 榜

  | 全部 | 海外直邮 | 美国榜 | 欧洲榜 | 澳新榜 | 亚洲榜 | 晒物榜 |
  | ---- | -------- | ------ | ------ | ------ | ------ | ------ |
  | 39   | 34       | 35     | 36     | 37     | 38     | hsw    |

  好文排行榜

  | 原创 | 资讯 |
  | ---- | ---- |
  | yc   | zx   |

  好物排行榜

  | 新晋榜 | 消费众测 | 新锐品牌 | 好物榜单 |
  | ------ | -------- | -------- | -------- |
  | hwall  | zc       | nb       | hw       |

  -   时间跨度

  | 3 小时 | 12 小时 | 24 小时 |
  | ------ | ------- | ------- |
  | 3      | 12      | 24      |`,
};

async function handler(ctx) {
    const { rank_type, rank_id, hour } = ctx.req.param();

    // When the hour is 3, some special rank_id require a special hour num
    const true_hour = getTrueHour(rank_type, rank_id, hour);

    const response = await got(`https://www.smzdm.com/top/json_more`, {
        headers: {
            Referer: 'https://www.smzdm.com/top/',
        },
        searchParams: {
            rank_type,
            rank_id,
            hour: true_hour,
        },
    });

    const data = response.data.data.list;
    const list1 = [];
    const list2 = [];
    for (let i = 0; i < Math.min(6, data.length); i++) {
        if (data[i][0].length !== 0) {
            list1.push(data[i][0]);
        }
        if (data[i][1].length !== 0) {
            list2.push(data[i][1]);
        }
    }
    const list = [...list1, ...list2];

    return {
        title: `${rank_type}榜-${rank_id}-${hour}小时`,
        link: 'https://www.smzdm.com/top/',
        allowEmpty: true,
        item: list.map((item) => ({
            title: `${item.article_title} - ${item.article_price}`,
            description: `${item.article_title} - ${item.article_price}<br><img src="${item.article_pic}">`,
            pubDate: timezone(item.article_pubdate, +8),
            link: item.article_url,
        })),
    };
}
