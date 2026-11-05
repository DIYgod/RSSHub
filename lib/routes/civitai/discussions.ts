import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/discussions/:modelId',
    categories: ['program-update'],
    example: '/civitai/discussions/4384',
    parameters: { modelId: 'N' },
    features: {
        requireConfig: [
            {
                name: 'CIVITAI_COOKIE',
                description: '',
                optional: true,
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['civitai.com/models/:modelId'],
        },
    ],
    name: 'Model discussions',
    maintainers: ['DIYgod'],
    handler,
    description: `::: warning
Need to configure \`CIVITAI_COOKIE\` to obtain image information of NSFW models.
:::`,
};

async function handler(ctx) {
    const params = ctx.req.param();
    const modelId = Number.parseInt(params.modelId);

    const { data } = await got(
        `https://civitai.com/api/trpc/resourceReview.getInfinite,comment.getAll?batch=1&input=${encodeURIComponent(
            JSON.stringify({
                0: { json: { modelId, limit: 12, sort: 'Newest' } },
                1: { json: { modelId, limit: 12, sort: 'newest' } },
            })
        )}`,
        {
            headers: {
                Referer: `https://civitai.com/${modelId}`,
                cookie: config.civitai.cookie,
            },
        }
    );

    const items: DataItem[] = [
        ...data[0].result.data.json.items.map((item) => ({ ...item, content: item.details, discussionType: 'review' })),
        ...data[1].result.data.json.comments.map((item) => ({ ...item, discussionType: 'comment' })),
    ]
        .map((item) =>
            item.images?.length || item.content
                ? {
                      title: item.content ? load(item.content).text() : 'Image',
                      link: `https://civitai.com/models/${params.modelId}?dialog=${item.discussionType === 'review' ? 'resourceReview' : 'commentThread'}&${item.discussionType === 'review' ? 'reviewId' : 'commentId'}=${item.id}`,
                      description: `${(item.images || []).map((image) => `<image src="https://imagecache.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/${image.url}/width=${image.width}/${image.id}">`).join('\n')}${item.content}`,
                      pubDate: parseDate(item.createdAt),
                      author: item.user?.username,
                      guid: `${item.discussionType}:${item.id}`,
                  }
                : null
        )
        .filter((item) => item !== null);

    return {
        title: `Civitai model ${params.modelId} discussions`,
        link: 'https://civitai.com/',
        item: items,
    };
}
