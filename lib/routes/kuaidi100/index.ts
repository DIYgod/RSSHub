import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/track/:number/:id/:phone?',
    categories: ['other'],
    example: '/kuaidi100/track/shunfeng/SF1007896781640/0383',
    parameters: { number: '快递公司代号', id: '订单号', phone: '手机号后四位（仅顺丰）' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '快递订单追踪',
    maintainers: ['NeverBehave'],
    handler,
};

async function handler(ctx) {
    // number is shorthand for company
    // id is ticket number
    // phone for shunfeng :)
    const { number, id, phone } = ctx.req.param();

    // I am doing these to avoid invaild request.
    // First, check if code is vaild
    const { status, message, company } = await utils.checkCode(number, id, phone);

    let data;
    let query;
    const time = new Date().toString();

    if (status) {
        query = await utils.getQuery(number, id, phone);
        data =
            query.status === '200'
                ? query.data
                : [
                      {
                          context: query.message,
                          time,
                      },
                  ];
    } else {
        throw new Error(`[本地]信息有误，请检查后重试：${message}`);
    }

    // Maybe we can look into isCheck, condition, and state :)
    // But I just want to make it work for now.
    return {
        title: `快递 ${company.name}-${id}`,
        link: 'https://www.kuaidi100.com',
        description: `快递 ${company.name}-${id}`,
        item: data.map((item) => ({
            title: item.context,
            description: item.context,
            guid: new Date(item.time || item.ftime).toUTCString(),
            pubDate: new Date(item.time || item.ftime).toUTCString(),
            link: 'https://www.kuaidi100.com',
        })),
    };
}
