import { html } from 'hono/html';
import pMap from 'p-map';

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
    description: '免费版账户每天查询次数为 10 次，若需增加查询次数请购买灰豚数据红薯版会员',
    name: '小红书笔记',
    maintainers: ['Skylwn'],
    handler,
};

interface Note {
    type: string;
    imageUrl: string;
    videoUrl: string;
    noteId: string;
    title: string;
    postTime: string | number;
}

async function handler(ctx) {
    if (!config.huitun || !config.huitun.cookie) {
        throw new ConfigNotFoundError('huitun RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }
    const cookie = config.huitun.cookie;
    const uid = ctx.req.param('user_id');
    const userResponse = await got({
        method: 'get',
        url: 'https://xhsapi.huitun.com/anchor/search/v2',
        searchParams: { keyword: uid },
        headers: {
            Cookie: cookie,
        },
    });
    const userData = JSON.parse(userResponse.body);
    if (!Array.isArray(userData?.extData?.list)) {
        throw new TypeError('Huitun did not return a user list. Check HUITUN_COOKIE and account access.');
    }
    if (!userData.extData.list[0]?.anchorId) {
        throw new Error('Huitun returned no matching account. Verify user_id and HUITUN_COOKIE.');
    }
    const anchorId = userData.extData.list[0].anchorId;
    const name = userData.extData.list[0].nick;
    const notesResponse = await got({
        method: 'get',
        url: 'https://xhsapi.huitun.com/anchor/detail/notesV2',
        searchParams: { sort: 0, anchorId },
        headers: {
            Cookie: cookie,
        },
    });
    const noteData = JSON.parse(notesResponse.body);
    if (!Array.isArray(noteData?.extData?.list)) {
        throw new TypeError('Huitun did not return a notes list. Check HUITUN_COOKIE and account access.');
    }
    const notes: Note[] = noteData.extData.list;
    const items = await pMap(
        notes,
        async (item) => {
            let desc: string;
            switch (item.type) {
                case 'normal':
                    desc = html`<p><img src="${item.imageUrl}" /></p>`.toString();
                    break;
                case 'video':
                    desc = html`<p><video controls poster="${item.imageUrl}" src="${item.videoUrl}" style="width: 100%;"></video></p>`.toString();
                    break;
                default:
                    throw new Error(`Unsupported Huitun note type: ${item.type}. Please report the source format to RSSHub.`);
            }
            const link = await getNoteLink(item.noteId, cookie);
            return {
                title: item.title,
                description: desc,
                link,
                pubDate: item.postTime,
            };
        },
        { concurrency: 3 }
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
            url: 'https://xhsapi.huitun.com/note/noteUrl',
            searchParams: { noteId },
            headers: {
                Cookie: cookie,
            },
        });
        const link = JSON.parse(response.body)?.extData;
        if (typeof link !== 'string' || !URL.canParse(link) || !['https:', 'http:'].includes(new URL(link).protocol)) {
            throw new Error('Huitun did not return a valid note URL. Check HUITUN_COOKIE and account access.');
        }
        return link;
    });
}
