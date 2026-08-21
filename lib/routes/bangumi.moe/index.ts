import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:tags{.+}?',
    categories: ['anime'],
    example: '/bangumi.moe',
    parameters: {
        tags: 'Tags, empty by default, multiple tags separated by `/`',
    },
    radar: [
        {
            source: ['bangumi.moe/'],
        },
    ],
    name: 'Latest',
    maintainers: ['nczitzk'],
    handler,
    url: 'bangumi.moe/',
};

async function handler(ctx) {
    const { tags } = ctx.req.param();
    const isLatest = !tags;
    const rootUrl = 'https://bangumi.moe';

    let response;
    let searchLink = rootUrl;

    if (isLatest) {
        const apiUrl = `${rootUrl}/api/torrent/latest`;

        response = await got({
            method: 'get',
            url: apiUrl,
        });
    } else {
        const torrentUrl = `${rootUrl}/api/torrent/search`;

        const tag_id = await searchTagIds(tags, rootUrl);
        searchLink = `${rootUrl}/search/${tag_id.join('+')}`;

        response = await got({
            method: 'post',
            url: torrentUrl,
            json: {
                tag_id,
            },
        });
    }

    let items =
        response.data.torrents?.slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30).map((item) => ({
            title: item.title,
            link: `${rootUrl}/torrent/${item._id}`,
            description: item.introduction,
            pubDate: parseDate(item.publish_time),
            enclosure_url: item.magnet,
            enclosure_type: 'application/x-bittorrent',
            category: item.tag_ids,
        })) ?? [];

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'post',
                    url: `${rootUrl}/api/tag/fetch`,
                    json: {
                        _ids: item.category,
                    },
                });

                item.category = [];

                for (const tag of detailResponse.data) {
                    for (const t of tag.synonyms) {
                        item.category.push(t);
                    }
                }

                return item;
            })
        )
    );

    return {
        title: '萌番组 Bangumi Moe',
        link: isLatest || items.length === 0 ? rootUrl : searchLink,
        item: items,
        allowEmpty: true,
    };
}

async function searchTagIds(tags, rootUrl): Promise<string[]> {
    const tagUrl = `${rootUrl}/api/tag/search`;

    const tagIds = await Promise.all(
        tags.split('/').map((param) =>
            cache.tryGet(`bangumi.moe:tag:${param}`, async () => {
                const paramResponse = await got({
                    method: 'post',
                    url: tagUrl,
                    json: {
                        name: decodeURIComponent(param),
                        keywords: true,
                        multi: true,
                    },
                });

                return paramResponse.data.found ? (paramResponse.data.tag.map((tag) => tag._id)[0] as string) : '';
            })
        )
    );

    return tagIds.toSorted((a, b) => a.localeCompare(b));
}
