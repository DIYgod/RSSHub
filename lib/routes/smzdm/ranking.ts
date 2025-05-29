import { config } from '@/config';
import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { getHeaders } from './utils';
import ConfigNotFoundError from '@/errors/types/config-not-found';

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

const typeOptions = [
    {
        value: 'pinlei',
        label: '好价品类榜',
    },
    {
        value: 'dianshang',
        label: '好价电商榜',
    },
    {
        value: 'haitao',
        label: '海淘 TOP 榜',
    },
    {
        value: 'haowen',
        label: '好文排行榜',
    },
    {
        value: 'haowu',
        label: '好物排行榜',
    },
];
const idOptions = [
    {
        label: '好价品类榜-全部',
        value: '11',
    },
    {
        label: '好价品类榜-食品生鲜',
        value: '12',
    },
    {
        label: '好价品类榜-电脑数码',
        value: '13',
    },
    {
        label: '好价品类榜-运动户外',
        value: '14',
    },
    {
        label: '好价品类榜-家用电器',
        value: '15',
    },
    {
        label: '好价品类榜-白菜',
        value: '17',
    },
    {
        label: '好价品类榜-服饰鞋包',
        value: '74',
    },
    {
        label: '好价品类榜-日用百货',
        value: '75',
    },
    {
        label: '好价电商榜-券活动',
        value: '24',
    },
    {
        label: '好价电商榜-京东',
        value: '23',
    },
    {
        label: '好价电商榜-天猫',
        value: '25',
    },
    {
        label: '好价电商榜-亚马逊中国',
        value: '26',
    },
    {
        label: '好价电商榜-国美在线',
        value: '27',
    },
    {
        label: '好价电商榜-苏宁易购',
        value: '28',
    },
    {
        label: '好价电商榜-网易',
        value: '29',
    },
    {
        label: '好价电商榜-西集网',
        value: '30',
    },
    {
        label: '好价电商榜-美国亚马逊',
        value: '31',
    },
    {
        label: '好价电商榜-日本亚马逊',
        value: '32',
    },
    {
        label: '好价电商榜-ebay',
        value: '33',
    },
    {
        label: '海淘 TOP 榜-全部',
        value: '39',
    },
    {
        label: '海淘 TOP 榜-海外直邮',
        value: '34',
    },
    {
        label: '海淘 TOP 榜-美国榜',
        value: '35',
    },
    {
        label: '海淘 TOP 榜-欧洲榜',
        value: '36',
    },
    {
        label: '海淘 TOP 榜-澳新榜',
        value: '37',
    },
    {
        label: '海淘 TOP 榜-亚洲榜',
        value: '38',
    },
    {
        label: '海淘 TOP 榜-晒物榜',
        value: 'hsw',
    },
    {
        label: '好文排行榜-原创',
        value: 'yc',
    },
    {
        label: '好文排行榜-资讯',
        value: 'zx',
    },
    {
        label: '好物排行榜-新晋榜',
        value: 'hwall',
    },
    {
        label: '好物排行榜-消费众测',
        value: 'zc',
    },
    {
        label: '好物排行榜-新锐品牌',
        value: 'nb',
    },
    {
        label: '好物排行榜-好物榜单',
        value: 'hw',
    },
];

export const route: Route = {
    path: '/ranking/:rank_type/:rank_id/:hour',
    categories: ['shopping', 'popular'],
    view: ViewType.Notifications,
    example: '/smzdm/ranking/pinlei/11/3',
    parameters: {
        rank_type: {
            description: '榜单类型',
            options: typeOptions,
        },
        rank_id: {
            description: '榜单ID',
            options: idOptions,
        },
        hour: {
            description: '时间跨度',
            options: [
                {
                    value: '3',
                    label: '3 小时',
                },
                {
                    value: '12',
                    label: '12 小时',
                },
                {
                    value: '24',
                    label: '24 小时',
                },
            ],
        },
    },
    features: {
        requireConfig: [
            {
                name: 'SMZDM_COOKIE',
                description: '什么值得买登录后的 Cookie 值',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '排行榜',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    if (!config.smzdm.cookie) {
        throw new ConfigNotFoundError('什么值得买排行榜 is disabled due to the lack of SMZDM_COOKIE');
    }

    const { rank_type, rank_id, hour } = ctx.req.param();

    // When the hour is 3, some special rank_id require a special hour num
    const true_hour = getTrueHour(rank_type, rank_id, hour);

    const response = await got(`https://www.smzdm.com/top/json_more`, {
        headers: {
            Referer: 'https://www.smzdm.com/top',
            ...getHeaders(),
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
        title: `什么值得买${typeOptions.find((item) => item.value === rank_type)?.label}-${idOptions.find((item) => item.value === rank_id)?.label}-${hour}小时`,
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
