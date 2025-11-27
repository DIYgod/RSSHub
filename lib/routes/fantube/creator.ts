import path from 'node:path';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

import { baseUrl, getCreatorFragment, getCreatorPostReelList } from './utils';

export const route: Route = {
    path: '/r18/creator/:identifier',
    categories: ['multimedia'],
    example: '/fantube/r18/creator/miyuu',
    parameters: { identifier: 'User handle' },
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
            source: ['www.fantube.tokyo/r18/creator/:identifier'],
        },
    ],
    name: 'User Posts',
    maintainers: ['TonyRL'],
    handler,
};

const render = ({ description, thumbnailUrl, sampleVideoId, imageUrls }) =>
    art(path.join(__dirname, 'templates/post.art'), {
        description,
        thumbnailUrl,
        sampleVideoId,
        imageUrls,
    });

async function handler(ctx) {
    const { identifier } = ctx.req.param();
    const limit = Number.parseInt(ctx.req.query('limit') || 18, 10);

    const creatorInfo = await getCreatorFragment(identifier);
    const posts = await getCreatorPostReelList(identifier, limit);

    const items = posts.map((p) => ({
        title: p.title.replaceAll('\n', ' ').trim(),
        description: render({
            description: p.description,
            thumbnailUrl: p.thumbnailUrl,
            sampleVideoId: p.sampleVideoId,
            imageUrls: p.contentData?.imageUrls || [],
        }),
        link: `${baseUrl}/r18/post/${p.id}?creator=${identifier}`,
        author: p.creator.displayName,
        pubDate: parseDate(p.publishStartAt),
        image: p.thumbnailUrl,
    }));

    return {
        title: `${creatorInfo.displayName}のプロフィール｜クリエイターページ｜FANTUBE(ファンチューブ)`,
        link: `${baseUrl}/r18/creator/${identifier}`,
        description: creatorInfo.description,
        image: creatorInfo.avatarImageUrl,
        icon: creatorInfo.avatarImageUrl,
        logo: creatorInfo.avatarImageUrl,
        language: 'ja',
        item: items,
    };
}
