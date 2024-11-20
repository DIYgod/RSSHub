import { Route } from '@/types';
import cache from '@/utils/cache';
import { getList, parseList, parseItem } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/news/list/:region/:listId',
    categories: ['new-media'],
    example: '/yahoo/news/list/hk/09fcf7b0-0ab2-11e8-bf1f-4d52d4f79454',
    parameters: { region: '`hk`, `tw`', listId: '見下表' },
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
            source: ['hk.news.yahoo.com/'],
        },
        {
            source: ['tw.news.yahoo.com/'],
        },
    ],
    name: '合作媒體',
    maintainers: ['TonyRL', 'williamgateszhao', 'tpnonthealps'],
    handler,
    description: `
| 合作媒體 (\`HK\`) | \`:listId\`                              |
| ----------------- | ---------------------------------------- |
| 東方日報          | \`33ddd580-0ab3-11e8-bfe1-4b555fb1e429\` |
| now.com           | \`01b4d760-0ab4-11e8-af3a-54037d3dced3\` |
| am730             | \`c4842090-0ab2-11e8-af7f-041a72ce7398\` |
| BBC               | \`4d3fc9a0-fac8-11e9-87f2-564ca250983e\` |
| 信報財經新聞      | \`5a8a0aa0-0ab3-11e8-b3dc-d990c79d6cb1\` |
| 香港電台          | \`b4bfc2d0-0ab3-11e8-bf9f-c888fc09923f\` |
| 法新社            | \`1cc44280-facb-11e9-ad7c-f3ba971275c8\` |
| Bloomberg         | \`40023670-facc-11e9-9dde-9175ff306602\` |
| 香港動物報        | \`6058fa9c-d74d-487a-8b49-aa99a2a2978e\` |`,
};

async function handler(ctx) {
    const { region, listId } = ctx.req.param();
    if (!['hk', 'tw'].includes(region)) {
        throw new InvalidParameterError(`Unsupported region: ${region}`);
    }

    const response = await getList(region, listId);

    // console.log('Response:', response.stream_items);
    // console.log('Type of response:', typeof response.stream_items);
    // console.log('Is response an array?', Array.isArray(response.stream_items));
    const list = parseList(region, response.stream_items);

    const items = await Promise.all(list.map((item) => parseItem(item, cache.tryGet)));

    const author = items[0].author;
    const atIndex = author.indexOf('@'); // fing '@'
    const source = atIndex === -1 ? author : author.substring(atIndex + 1).trim();
    // console.log(source);

    return {
        title: `Yahoo 新聞 - ${source ?? ''}`,
        link: `https://${region}.news.yahoo.com`,
        image: 'https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo-1200x1200.png',
        item: items,
    };
}
