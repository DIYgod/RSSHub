import { Route } from '@/types';
import got from '@/utils/got';
import { parseList, parseItem } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const channelMap = {
    calendar: 'pac',
    institute: 'predator',
    foodlab: 'predator',
    pretty: 'beauty',
};

export const route: Route = {
    path: '/column/:channel',
    categories: ['new-media'],
    example: '/guokr/column/calendar',
    parameters: { channel: '专栏类别' },
    radar: [
        {
            source: ['guokr.com/:channel'],
        },
    ],
    name: '果壳网专栏',
    maintainers: ['DHPO', 'hoilc'],
    handler,
    url: 'guokr.com/',
    description: `| 物种日历 | 吃货研究所 | 美丽也是技术活 |
| -------- | ---------- | -------------- |
| calendar | institute  | beauty         |`,
};

async function handler(ctx) {
    const channel = channelMap[ctx.req.param('channel')] ?? ctx.req.param('channel');

    const { data: response } = await got(`https://www.guokr.com/apis/minisite/article.json`, {
        searchParams: {
            retrieve_type: 'by_wx',
            channel_key: channel,
            offset: 0,
            limit: 10,
        },
    });
    const result = parseList(response.result);

    if (result.length === 0) {
        throw new InvalidParameterError('Unknown channel');
    }

    const channelName = result[0].channels[0].name;
    const channelUrl = result[0].channels[0].url;

    const items = await Promise.all(result.map((item) => parseItem(item)));

    return {
        title: `果壳网 ${channelName}`,
        link: channelUrl,
        item: items,
    };
}
