// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const { token, apiUrl, rootUrl, renderDesc, getBoards } = require('./utils');

export default async (ctx) => {
    const { board = '' } = ctx.req.param();
    const title = board ? (await getBoards(cache.tryGet)).find((i) => i.boardId === board).title : '全部';

    const { data } = await got(`${apiUrl}/article`, {
        searchParams: {
            api_token: token,
            user_id: '0',
            board_id: board,
            sort: 'time',
            page: '1',
            device: 'web',
            my_school_opinion: '1',
        },
    });

    const items = data.articles.map((item) => ({
        title: item.title,
        description: item.abstract,
        pubDate: timezone(parseDate(item.created_at), +8),
        link: `${rootUrl}/article/${item.id}`,
        api: `${apiUrl}/article/${item.id}`,
        author: `${item.university} ${item.user_name}`,
        category: item.board_name,
    }));

    await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await got(item.api, {
                    searchParams: {
                        api_token: token,
                        user_id: '0',
                        device: 'web',
                        ref: '',
                    },
                });
                item.description = renderDesc(data);
                delete item.api;
                return item;
            })
        )
    );

    ctx.set('data', {
        title: `Zuvio 校園${title}話題 - 大學生論壇`,
        description: 'Zuvio 校園話題千種動物頭像交流心得。最萌的匿名論壇，上千種逗趣動物頭像隨你變換，點頭像立即私訊功能，讓你找到共同話題的小夥伴！多人分享配對心得、聊天交友心情在此，快加入17分享！',
        image: 'https://s3.hicloud.net.tw/zuvio.public/public/system/images/irs_v4/chicken/shared/webshare.png',
        link: `${rootUrl}/articles`,
        item: items,
        language: 'zh-Hant',
    });
};
