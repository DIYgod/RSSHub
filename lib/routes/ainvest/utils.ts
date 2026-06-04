import { config } from '@/config';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const contentStreamUrl = 'https://news.ainvest.com/news-w-ds-hxcmp-content-stream/content_stream/api/stream_item/v1/query_content_stream';
const contentPageUrl = 'https://news.ainvest.com/content-page/v1/page';

const normalizeItem = (item) => ({
    title: item.title,
    link: item.h5_url,
    pubDate: parseDate(item.ctime, 'X'),
    category: item.content_tags.map((tag) => tag.name),
    author: item.author_name,
    image: item.cover_image,
    seoKey: item.seo_key,
});

export const fetchContentStream = (streamId, limit) =>
    cache.tryGet(
        `ainvest:news:${streamId}:${limit}`,
        async () => {
            const response = await ofetch(contentStreamUrl, {
                query: {
                    lang: 'en',
                    pageSize: limit,
                    stream_id: streamId,
                    page: 1,
                },
            });
            return response.data.list;
        },
        config.cache.routeExpire,
        false
    );

export const fetchContentItems = async (streamIds, limit) => {
    const streams = await Promise.all(streamIds.map((streamId) => fetchContentStream(streamId, limit)));
    const list = streams.flat().map((item) => normalizeItem(item));

    return Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(`${contentPageUrl}/${item.seoKey}`);
                const { data } = response;

                item.description = data.pageInfo.structuredContent.map((c) => c.content).join('');
                item.image = data.contentInfo.coverImage;

                return item;
            })
        )
    );
};
