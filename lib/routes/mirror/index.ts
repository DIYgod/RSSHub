import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import MarkdownIt from 'markdown-it';
const md = MarkdownIt({
    html: true,
    linkify: true,
});
import { isValidHost } from '@/utils/valid-host';
import InvalidParameterError from '@/errors/types/invalid-parameter';

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

    const response = await got(currentUrl);

    const data = JSON.parse(response.data.match(/"__NEXT_DATA__" type="application\/json">({"props":.*})<\/script>/)[1]);

    const items = Object.keys(data.props.pageProps.__APOLLO_STATE__)
        .filter((key) => key.startsWith('entry:'))
        .map((key) => {
            const item = data.props.pageProps.__APOLLO_STATE__[key];
            return {
                title: item.title,
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
