// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const { board = 'realtime' } = ctx.req.param();
    const link = `https://top.baidu.com/board?tab=${board}`;
    const { data: response } = await got(link);

    const $ = load(response);

    const { data } = JSON.parse(
        $('#sanRoot')
            .contents()
            .filter((e) => e.nodeType === 8)
            .prevObject[0].data.match(/s-data:(.*)/)[1]
    );

    const items = data.cards[0].content.map((item) => ({
        title: item.word,
        description: art(path.join(__dirname, 'templates/top.art'), {
            item,
        }),
        link: item.rawUrl,
    }));

    ctx.set('data', {
        title: `${data.curBoardName} - 百度热搜`,
        description: $('meta[name="description"]').attr('content'),
        link,
        item: items,
    });
};
