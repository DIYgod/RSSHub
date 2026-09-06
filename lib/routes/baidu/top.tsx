import { load } from 'cheerio';
import type { Comment } from 'domhandler';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';

const renderDescription = (item) =>
    renderToString(
        <>
            {item.img ? (
                <>
                    <img src={item.img} />
                    <br />
                </>
            ) : null}
            {item.show
                ? item.show.map((text) => (
                      <>
                          {text}
                          <br />
                      </>
                  ))
                : null}
            {item.desc}
        </>
    );

export const route: Route = {
    path: '/top/:board?',
    categories: ['other'],
    example: '/baidu/top',
    parameters: { board: '榜单，默认为 `realtime`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '热搜榜单',
    maintainers: ['xyqfer'],
    handler,
    description: `| 热搜榜   | 小说榜 | 电影榜 | 电视剧榜 | 汽车榜 | 游戏榜 |
| -------- | ------ | ------ | -------- | ------ | ------ |
| realtime | novel  | movie  | teleplay | car    | game   |`,
};

async function handler(ctx) {
    const { board = 'realtime' } = ctx.req.param();
    const link = `https://top.baidu.com/board?tab=${board}`;
    const { data: response } = await got(link);

    const $ = load(response);

    const sDataMatch = $('#sanRoot')
        .contents()
        .toArray()
        .find((e): e is Comment => e.nodeType === 8)
        ?.data.match(/s-data:(.*)/);
    if (!sDataMatch) {
        throw new Error('Unable to find s-data in page');
    }
    const { data } = JSON.parse(sDataMatch[1]);

    const items = data.cards[0].content.map((item) => ({
        title: item.word,
        description: renderDescription(item),
        link: item.rawUrl,
    }));

    return {
        title: `${data.curBoardName} - 百度热搜`,
        description: $('meta[name="description"]').attr('content'),
        link,
        item: items,
    };
}
