import { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import sanitizeHtml from 'sanitize-html';
import { parseToken, getJsonResult, getPuppeteerPage } from '@/routes/xueqiu/cookies';

const rootUrl = 'https://xueqiu.com';

export const route: Route = {
    path: '/user/:id/:type?',
    categories: ['finance'],
    example: '/xueqiu/user/8152922548',
    parameters: { id: '用户 id, 可在用户主页 URL 中找到', type: '动态的类型, 不填则默认全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['xueqiu.com/u/:id'],
            target: '/user/:id',
        },
    ],
    name: '用户动态',
    maintainers: ['imlonghao'],
    handler,
    description: `| 原发布 | 长文 | 问答 | 热门 | 交易 |
  | ------ | ---- | ---- | ---- | ---- |
  | 0      | 2    | 4    | 9    | 11   |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const type = ctx.req.param('type') || 10;
    const source = type === '11' ? '买卖' : '';
    const typename = {
        10: '全部',
        0: '原发布',
        2: '长文',
        4: '问答',
        9: '热门',
        11: '交易',
    };

    const link = `${rootUrl}/u/${id}`;
    const token = await parseToken(link);

    const url = `${rootUrl}/v4/statuses/user_timeline.json?user_id=${id}&type=${type}&source=${source}`;

    const res2 = await getJsonResult(url, token);

    const data = res2.statuses.filter((s) => s.mark !== 1); // 去除置顶动态

    const items = await Promise.all(
        data.map((item) =>
            cache.tryGet(item.target, async () => {
                const page = await getPuppeteerPage(token);

                await page.goto(`${rootUrl}${item.target}`, {
                    waitUntil: 'domcontentloaded',
                });

                const detailResponse = await page.content();

                const snowmanStatus = detailResponse.match(/SNOWMAN_STATUS = (.*?});/);

                if (snowmanStatus === null) {
                    throw new Error('snowmanStatus is null');
                }

                const data = JSON.parse(snowmanStatus[1]);
                item.text = data.text;

                const retweetedStatus = item.retweeted_status ? `<blockquote>${item.retweeted_status.user.screen_name}:&nbsp;${item.retweeted_status.description}</blockquote>` : '';
                const description = item.description + retweetedStatus;

                return {
                    title: item.title || sanitizeHtml(description, { allowedTags: [], allowedAttributes: {} }),
                    description: item.text ? item.text + retweetedStatus : description,
                    pubDate: parseDate(item.created_at),
                    link: rootUrl + item.target,
                };
            })
        )
    );

    return {
        title: `${data[0].user.screen_name} 的雪球${typename[type]}动态`,
        link,
        description: `${data[0].user.screen_name} 的雪球${typename[type]}动态`,
        item: items,
    };
}
