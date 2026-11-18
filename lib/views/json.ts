import type { Data } from '@/types';

/**
 * This function should be used by RSSHub middleware only.
 * @param {object} data ctx.state.data
 * @returns `JSON.stringify`-ed [JSON Feed](https://www.jsonfeed.org/)
 */
const json = (data: Data) => {
    const jsonFeed = {
        version: 'https://jsonfeed.org/version/1.1',
        title: data.title || 'RSSHub',
        home_page_url: data.link || 'https://docs.rsshub.app',
        feed_url: data.feedLink,
        description: `${data.description || data.title} - Powered by RSSHub`,
        icon: data.image,
        authors: data.author === undefined || Array.isArray(data.author) ? data.author : [{ name: data.author }],
        language: data.language || 'zh-cn',
        items: data.item?.map((item) => ({
            id: item.guid || item.id || item.link,
            url: item.link,
            title: item.title,
            // content_html and content_text are each optional strings — but one or both must be present
            content_html: item.description,
            content_text: item.content?.text || (item.description ? undefined : item.title),
            summary: item.summary,
            image: item.image || item.itunes_item_image,
            banner_image: item.banner,
            date_published: item.pubDate,
            date_modified: item.updated,
            authors: item.author === undefined || Array.isArray(item.author) ? item.author : [{ name: item.author }],
            tags: item.category === undefined || Array.isArray(item.category) ? item.category : [item.category],
            language: item.language,
            attachments:
                item.attachments ||
                (item.enclosure_url
                    ? [
                          {
                              url: item.enclosure_url,
                              mime_type: item.enclosure_type,
                              title: item.enclosure_title,
                              size_in_bytes: item.enclosure_length,
                              duration_in_seconds: item.itunes_duration,
                          },
                      ]
                    : undefined),
            _extra: item._extra || undefined,
        })),
    };
    return JSON.stringify(jsonFeed);
};

export default json;
