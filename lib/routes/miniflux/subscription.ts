import { Route } from '@/types';
import got from '@/utils/got';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';

export const route: Route = {
    path: '/subscription/:parameters?',
    description: `
1. If no specific parameters are specified, all subscription sources will be output by default.
2. Please obtain the Category ID or Subscription Source ID on the \`Category\` (shortcut \`g\` \`c\`) or \`Source\` (shortcut \`g\` \`f\`) page. The URL of each category (or subscription source) will display its ID information.
3. Support for category names and category IDs, to output multiple categories, please repeat entering \`category=\` and connect with \`&\`, or directly use **English** commas between different category names. For example, you can subscribe through \`/miniflux/subscription/category=technology&category=1\` or \`/miniflux/subscription/categories=technology,1\`.
4. Support specifying the subscription source name or subscription source ID, similar to setting categories. For example, you can subscribe through \`/miniflux/subscription/feed=1&feed=Archdaily\` or \`/miniflux/subscription/feeds=1,Archdaily\`.
5. Support simultaneously specifying subscription source information and category information; it will output subscription sources that meet the selected categories' criteria. Consider an example: by using \`/miniflux/subscription/feeds=1,archdaily&category=art,7\`, if the Subscription Source ID is 1 or the Subscription Source Name is ArchDaily indeed falls under Category 'art' or has a Category ID of 7, then output that subscription source information.
    `,
    categories: ['other'],
    example: '/miniflux/subscription/categories=test',
    parameters: {
        parameters: 'Category name or category ID or/and subscription source name or subscription source ID',
    },
    features: {
        requireConfig: [
            {
                name: 'MINIFLUX_INSTANCE',
                description: 'The instance used by the user, by default, is the official MiniFlux [paid service address](https://reader.miniflux.app)',
            },
            {
                name: 'MINIFLUX_TOKEN',
                description: "User's API key, please log in to the instance used and go to `Settings` -> `API Key` -> `Create a new API key` to obtain.",
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Subscriptions',
    maintainers: ['emdoe', 'DIYgod'],
    handler,
};

async function handler(ctx) {
    const instance = config.miniflux.instance;
    const token = config.miniflux.token;

    if (!token) {
        throw new ConfigNotFoundError('This RSS feed is disabled due to its incorrect configuration: the token is missing.');
    }

    function set(item) {
        if (item.search('=') === -1) {
            return '';
        }
        const filter = item.slice(0, item.indexOf('='));
        const option = item.slice(item.lastIndexOf('=') + 1);
        if (filter.search('categor') !== -1) {
            option.split(',').map((item) => categories.push(item.toString().toLowerCase()));
            return filter;
        }
        if (filter.search('feed') === -1) {
            return '';
        } else {
            option.split(',').map((item) => feeds.push(item.toString().toLowerCase()));
            return filter;
        }
    }

    function addFeed(item) {
        subscription.push({
            title: item.title,
            link: item.site_url,
            pubData: item.last_modified_header,
            description: 'Feed URL: ' + `<a href=${item.feed_url}>${item.feed_url}</a>`,
        });
    }

    const response = await got.get(`${instance}/v1/feeds`, {
        headers: { 'X-Auth-Token': token },
    });

    const subscription = [];
    const categories = [];
    const feeds = [];
    const feedsList = response.data;

    const parameters = ctx.req
        .param('parameters')
        ?.split('&')
        .map((parameter) => set(parameter))
        .join('');

    if (parameters) {
        for (const item of feedsList) {
            if (categories.length && feeds.length) {
                const categoryTitle = item.category.title.toLowerCase();
                const categoryID = item.category.id.toString();
                const feedID = item.id.toString();
                const feedTitle = item.title.toLowerCase();
                if ((categories.includes(categoryID) || categories.includes(categoryTitle)) && (feeds.includes(feedID) || feeds.includes(feedTitle))) {
                    addFeed(item);
                }
            } else if (categories.length) {
                const categoryTitle = item.category.title.toLowerCase();
                const categoryID = item.category.id.toString();
                if (categories.includes(categoryID) || categories.includes(categoryTitle)) {
                    addFeed(item);
                }
            } else if (feeds.length) {
                const feedID = item.id.toString();
                const feedTitle = item.title.toLowerCase();
                if (feeds.includes(feedID) || feeds.includes(feedTitle)) {
                    addFeed(item);
                }
            }
        }
    } else {
        for (const item of feedsList) {
            addFeed(item);
        }
    }

    return {
        title: `MiniFlux | Subscription List`,
        link: instance,
        description: `A subscription tracking feed.`,
        item: subscription,
        allowEmpty: true,
    };
}
