const art = require('art-template');

// We may add more control over it later

/**
 * This function should be used by RSSHub middleware only.
 * @param {object} data ctx.state.data
 * @returns `JSON.stringify`-ed [JSON Feed](https://www.jsonfeed.org/)
 */
const json = (data) => {
    const jsonFeed = {
        version: 'https://jsonfeed.org/version/1.1',
        title: data.title || 'RSSHub',
        home_page_url: data.link || 'https://docs.rsshub.app',
        feed_url: data.feedLink,
        description: `${data.description || data.title} - Made with love by RSSHub(https://github.com/DIYgod/RSSHub)`,
        icon: data.image,
        authors: typeof data.author === 'string' ? [{ name: data.author }] : data.author,
        language: data.language || 'zh-cn',
        items: data.item.map((item) => ({
            id: item.guid || item.id || item.link,
            url: item.link,
            title: item.title,
            content_html: (item.content && item.content.html) || item.description || item.title,
            content_text: item.content && item.content.text,
            image: item.image,
            banner_image: item.banner,
            date_published: item.pubDate,
            date_modified: item.updated,
            authors: typeof item.author === 'string' ? [{ name: item.author }] : item.author,
            tags: typeof item.category === 'string' ? [item.category] : item.category,
            language: item.language,
            attachments: item.enclosure_url
                ? [
                      {
                          url: item.enclosure_url,
                          mime_type: item.enclosure_type,
                          title: item.enclosure_title,
                          size_in_bytes: item.enclosure_length,
                          duration_in_seconds: item.itunes_duration,
                      },
                  ]
                : undefined,
        })),
    };
    return JSON.stringify(jsonFeed, null, 4);
};

module.exports = {
    art,
    json,
};
