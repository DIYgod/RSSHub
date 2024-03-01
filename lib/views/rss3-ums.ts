import dayjs from 'dayjs';

/**
 * This function should be used by RSSHub middleware only.
 * @param {object} data ctx.state.data
 * @returns `JSON.stringify`-ed [UMS Result](https://docs.rss3.io/docs/unified-metadata-schemas)
 */

const NETWORK = 'RSS';
const TAG = 'RSS';
const TYPE = 'feed';

const rss3Ums = (data) => {
    const currentUnixTsp = dayjs().unix();
    const umsResult = {
        data: data.item.map((item) => {
            const owner = getOwnershipFieldFromURL(item);
            return {
                owner,
                id: item.link,
                network: NETWORK,
                from: owner,
                to: owner,
                tag: TAG,
                type: TYPE,
                direction: 'out',
                feeValue: '0',
                actions: [
                    {
                        tag: TAG,
                        type: TYPE,
                        platform: owner,
                        from: owner,
                        to: owner,
                        metadata: {
                            authors: typeof item.author === 'string' ? [{ name: item.author }] : item.author,
                            description: item.description,
                            pub_date: item.pubDate,
                            tags: typeof item.category === 'string' ? [item.category] : item.category,
                            title: item.title,
                        },
                        related_urls: [item.link],
                    },
                ],
                timestamp: dayjs(item.updated).unix() || currentUnixTsp,
            };
        }),
    };
    return umsResult;
};

// we treat the domain as the owner of the content
function getOwnershipFieldFromURL(item) {
    try {
        const urlObj = new URL(item.link);
        return urlObj.hostname;
    } catch {
        return item.link;
    }
}

export default rss3Ums;
