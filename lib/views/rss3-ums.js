const dayjs = require('dayjs');

/**
 * This function should be used by RSSHub middleware only.
 * @param {object} data ctx.state.data
 * @returns `JSON.stringify`-ed [UMS Result](https://docs.rss3.io/docs/unified-metadata-schemas)
 */

const rss3_ums = (data) => {
    const network = 'RSS';
    const tag = 'RSS';
    const type = 'article';
    const currentUnixTsp = dayjs().unix();
    const umsResult = {
        data: data.item.map((item) => {
            const owner = getOwnershipFieldFromURL(item);
            return {
                owner,
                id: item.link,
                network,
                from: owner,
                to: owner,
                tag,
                type,
                direction: 'out',
                feeValue: '0',
                actions: [
                    {
                        tag,
                        type,
                        platform: owner,
                        from: owner,
                        to: owner,
                        metadata: {
                            title: item.title,
                            description: item.description,
                            authors: [],
                            tags: typeof item.category === 'string' ? [item.category] : item.category,
                            pubDate: item.pubDate,
                        },
                        related_urls: [item.link],
                    },
                ],
                timestamp: dayjs(item.updated).unix() || currentUnixTsp,
            };
        }),
    };
    return JSON.stringify(umsResult, null, 4);
};

// we treat the domain as the owner of the content
function getOwnershipFieldFromURL(item) {
    try {
        const urlObj = new URL(item.link);
        return urlObj.hostname;
    } catch (e) {
        return item.link;
    }
}

module.exports = rss3_ums;
