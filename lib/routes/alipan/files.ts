import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { AnonymousShareInfo, ShareList, TokenResponse } from './types';

export const route: Route = {
    path: '/files/:share_id/:parent_file_id?',
    example: '/alipan/files/jjtKEgXJAtC/64a957744876479ab17941b29d1289c6ebdd71ef',
    parameters: { share_id: '分享 id，可以从分享页面 URL 中找到', parent_file_id: '文件夹 id，可以从文件夹页面 URL 中找到' },
    radar: [
        {
            source: ['www.alipan.com/s/:share_id/folder/:parent_file_id', 'www.alipan.com/s/:share_id'],
        },
    ],
    name: '文件列表',
    maintainers: ['DIYgod'],
    handler,
    url: 'www.alipan.com/s',
};

async function handler(ctx) {
    const { share_id, parent_file_id } = ctx.req.param();
    const url = `https://www.aliyundrive.com/s/${share_id}${parent_file_id ? `/folder/${parent_file_id}` : ''}`;

    const headers = {
        referer: 'https://www.aliyundrive.com/',
        origin: 'https://www.aliyundrive.com',
        'x-canary': 'client=web,app=share,version=v2.3.1',
    };

    const shareRes = await ofetch<AnonymousShareInfo>('https://api.aliyundrive.com/adrive/v3/share_link/get_share_by_anonymous', {
        method: 'POST',
        headers,
        query: {
            share_id,
        },
        body: {
            share_id,
        },
    });

    const tokenRes = await ofetch<TokenResponse>('https://api.aliyundrive.com/v2/share_link/get_share_token', {
        method: 'POST',
        headers,
        body: {
            share_id,
        },
    });
    const shareToken = tokenRes.share_token;

    const listRes = await ofetch<ShareList>('https://api.aliyundrive.com/adrive/v2/file/list_by_share', {
        method: 'POST',
        headers: {
            ...headers,
            'x-share-token': shareToken,
        },
        body: {
            limit: 100,
            order_by: 'created_at',
            order_direction: 'DESC',
            parent_file_id: parent_file_id || 'root',
            share_id,
        },
    });

    const result = listRes.items.map((item) => ({
        title: item.name,
        description: item.name + (item.thumbnail ? `<img src="${item.thumbnail}">` : ''),
        link: url,
        pubDate: parseDate(item.created_at),
        updated: parseDate(item.updated_at),
        guid: item.file_id,
    }));

    return {
        title: `${shareRes.display_name || `${share_id}${parent_file_id ? `-${parent_file_id}` : ''}`}-阿里云盘`,
        link: url,
        item: result,
    };
}
