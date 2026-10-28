import MarkdownIt from 'markdown-it';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';
import { isValidHost } from '@/utils/valid-host';

const md = MarkdownIt({
    html: true,
    linkify: true,
});

export const route: Route = {
    path: '/:id',
    categories: ['new-media'],
    example: '/mirror/tingfei.eth',
    parameters: { id: 'user id' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'User',
    maintainers: ['fifteen42', 'rde9', 'nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    if (!id.endsWith('.eth') && !isValidHost(id)) {
        throw new InvalidParameterError('Invalid id');
    }
    const rootUrl = 'https://mirror.xyz';
    const currentUrl = id.endsWith('.eth') ? `${rootUrl}/${id}` : `https://${id}.mirror.xyz`;

    const response = await ofetch.raw(currentUrl, { responseType: 'text' });
    const redirectedUrl = new URL(response.url);
    if (['paragraph.com', 'www.paragraph.com'].includes(redirectedUrl.hostname) && redirectedUrl.pathname.startsWith('/@')) {
        const publication = redirectedUrl.pathname.split('/', 2)[1];
        const feed = await parser.parseString(await ofetch(`https://paragraph.com/api/blogs/rss/${encodeURIComponent(publication)}`, { responseType: 'text' }));
        return {
            title: `${feed.title} - Mirror`,
            description: feed.description,
            image: feed.image?.url,
            link: feed.link ?? redirectedUrl.href,
            item: feed.items.map((item) => ({
                title: item.title ?? '',
                description: item['content:encoded'] ?? item.content ?? item.summary,
                link: item.link,
                guid: item.guid,
                author: item.creator ?? item.author,
                pubDate: item.isoDate || item.pubDate ? parseDate(item.isoDate ?? item.pubDate!) : undefined,
                category: item.categories,
            })),
        };
    }

    const dataMatch = response._data?.match(/"__NEXT_DATA__" type="application\/json">(\{"props":.*\})<\/script>/);
    if (!dataMatch) {
        throw new Error('Mirror publication data was not found. Check whether the publication has moved to Paragraph.');
    }
    const data = JSON.parse(dataMatch[1]);

    const items = Object.keys(data.props.pageProps.__APOLLO_STATE__)
        .filter((key) => key.startsWith('entry:'))
        .map((key) => {
            const item = data.props.pageProps.__APOLLO_STATE__[key];
            return {
                title: item.title ?? '',
                description: md.render(item.body),
                link: `${currentUrl}/${item._id}`,
                pubDate: parseDate(item.publishedAtTimestamp, 'X'),
                author: data.props.pageProps.publicationLayoutProject.displayName,
            };
        });

    return {
        title: `${data.props.pageProps.publicationLayoutProject.displayName} - Mirror`,
        description: data.props.pageProps.publicationLayoutProject.description,
        image: data.props.pageProps.publicationLayoutProject.avatarURL,
        link: currentUrl,
        item: items,
    };
}
