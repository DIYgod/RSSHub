import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

export const route: Route = {
    path: '/xiaohongshu/:user_id',
    categories: ['social-media'],
    example: '/huitun/xiaohongshu/52d8c541b4c4d60e6c867480',
    parameters: { user_id: '小红书用户号，需登录小红书网页端查询' },
    features: {
        requireConfig: [
            {
                name: 'HUITUN_COOKIE',
                description: '灰豚数据 cookie 值',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    description: `免费版账户每天查询次数为10次, 若需增加查询次数请购买灰豚数据红薯版会员`,
    name: '小红书笔记',
    maintainers: ['Skylwn'],
    handler,
};

async function handler(ctx) {
    if (!config.huitun || !config.huitun.cookie) {
        throw new ConfigNotFoundError('huitun RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }
    const cookie = config.huitun.cookie;
    const uid = ctx.req.param('user_id');
    const response_user = await got({
        method: 'get',
        url: 'https://xhsapi.huitun.com/anchor/search/v2?keyword=' + uid,
        headers: {
            Cookie: cookie,
        },
    });
    const user_data = JSON.parse(response_user.body);
    const anchorId = user_data.extData.list[0].anchorId;
    const name = user_data.extData.list[0].nick;
    const response_note = await got({
        method: 'get',
        url: 'https://xhsapi.huitun.com/anchor/detail/notesV2?sort=0&anchorId=' + anchorId,
        headers: {
            Cookie: cookie,
        },
    });
    const note_data = JSON.parse(response_note.body);
    const notes = note_data.extData.list;
    const items = await Promise.all(
        notes.map(async (item) => {
            let desc: string;
            switch (item.type) {
                case 'normal':
                    desc = `<p><img src="${item.imageUrl}"></p>`;
                    break;
                case 'video':
                    desc = `<p><video 
                                controls 
                                poster="${item.imageUrl}" 
                                src="${item.videoUrl}" 
                                style="width: 100%;"
                            ></video></p>`;
                    break;
                default:
                    desc = `未知类型: ${item.type}, 请点击<a href="https://github.com/DIYgod/RSSHub/issues">链接</a>提交issue`;
            }
            const link = await getNoteLink(item.noteId, cookie);
            return {
                title: item.title,
                description: desc,
                link,
                pubDate: item.postTime,
            };
        })
    );

    return {
        title: name + ' - 小红书笔记',
        description: '',
        link: 'https://www.xiaohongshu.com/user/profile/' + uid,
        item: items,
    };
}

async function getNoteLink(noteId, cookie) {
    return await cache.tryGet(`huitun:notelink:${noteId}`, async () => {
        const response = await got({
            method: 'get',
            url: 'https://xhsapi.huitun.com/note/noteUrl?noteId=' + noteId,
            headers: {
                Cookie: cookie,
            },
        });
        return JSON.parse(response.body).extData;
    });
}
