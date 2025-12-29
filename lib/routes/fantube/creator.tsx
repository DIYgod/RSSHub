import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

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

const renderDescription = ({ description, thumbnailUrl, sampleVideoId, imageUrls }): string =>
    renderToString(
        <>
            {thumbnailUrl ? (
                <>
                    <img src={thumbnailUrl} />
                    <br />
                </>
            ) : null}
            {imageUrls?.map((img, index) => (
                <>
                    <img key={`${img}-${index}`} src={img} />
                    <br />
                </>
            ))}
            {sampleVideoId ? (
                <>
                    <div style="position: relative; padding-top: 56.25%">
                        <iframe
                            src={`https://customer-7d4xajfg7g3ps2lm.cloudflarestream.com/${sampleVideoId}/iframe`}
                            style="border: none; position: absolute; top: 0; height: 100%; width: 100%"
                            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                            allowfullscreen="true"
                        ></iframe>
                    </div>
                    <br />
                </>
            ) : null}
            {description ? raw(description.replaceAll('\n', '<br>')) : null}
        </>
    );

async function handler(ctx) {
    const { identifier } = ctx.req.param();
    const limit = Number.parseInt(ctx.req.query('limit') || 18, 10);

    const creatorInfo = await getCreatorFragment(identifier);
    const posts = await getCreatorPostReelList(identifier, limit);

    const items = posts.map((p) => ({
        title: p.title.replaceAll('\n', ' ').trim(),
        description: renderDescription({
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
