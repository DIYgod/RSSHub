import ConfigNotFoundError from '@/errors/types/config-not-found';
import ofetch from '@/utils/ofetch';
import { Route } from '@/types';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/list/:routeParams?',
    categories: ['reading'],
    example: '/readwise/list/location=new&category=article',
    parameters: { routeParams: 'Parameter combinations, see the description above.' },
    features: {
        requireConfig: [
            {
                name: 'READWISE_ACCESS_TOKEN',
                optional: false,
                description: 'Visit `https://readwise.io/access_token` to get your access token.',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['read.readwise.io'],
            target: '/list',
        },
    ],
    name: 'Reader Document List',
    maintainers: ['xbot'],
    handler,
    description: `Specify options (in the format of query string) in parameter \`routeParams\` to filter documents.

| Parameter                  | Description                                                                            |   Values                                                                                    |  Default                             |
| -------------------------- | -------------------------------------------------------------------------------------- |   ----------------------------------------------------------------------------------------- |  ----------------------------------- |
| \`location\`               | The document's location.                                                               |   \`new\`/\`later\`/\`shortlist\`/\`archive\`/\`feed\`                                      |                                      |
| \`category\`               | The document's category.                                                               |   \`article\`/\`email\`/\`rss\`/\`highlight\`/\`note\`/\`pdf\`/\`epub\`/\`tweet\`/\`video\` |                                      |
| \`updatedAfter\`           | Fetch only documents updated after this date.                                          |   string (formatted as ISO 8601 date)                                                       ||
| \`tag\`                    | The document's tag, can be specified once or multiple times.                           |||
| \`tagStrategy\`            | If multiple tags are specified, should the documents match all of them or any of them. |   \`any\`/\`all\`                                                                           |  \`any\`                             |

Customise parameter values to fetch specific documents, for example:

\`\`\`
https://rsshub.app/readwise/list/location=new&category=article
\`\`\`

fetches articles in the Inbox.

\`\`\`
https://rsshub.app/readwise/list/category=article&tag=shortlist&tag=AI&tagStrategy=all
\`\`\`

fetches articles tagged both by \`shortlist\` and \`AI\`. `,
};

const TAG_STRATEGY_ALL = 'all'; // Items with tags matching all the given ones can then be returned.
const TAG_STRATEGY_ANY = 'any'; // Items with tags matching any of the given ones can be returned.

async function handler(ctx) {
    if (!config.readwise || !config.readwise.accessToken) {
        throw new ConfigNotFoundError('Readwise access token is missing');
    }

    let apiUrl = 'https://readwise.io/api/v3/list/?';
    let tag, tagStrategy;

    if (ctx.req.param('routeParams')) {
        const urlSearchParams = new URLSearchParams(ctx.req.param('routeParams'));

        const location = urlSearchParams.get('location');
        const category = urlSearchParams.get('category');
        const updatedAfter = urlSearchParams.get('updatedAfter');

        tag = urlSearchParams.get('tag');
        tagStrategy = urlSearchParams.get('tagStrategy') === TAG_STRATEGY_ANY || urlSearchParams.get('tagStrategy') === TAG_STRATEGY_ALL ? urlSearchParams.get('tagStrategy') : TAG_STRATEGY_ANY;

        if (location) {
            apiUrl += `location=${location}&`;
        }
        if (category) {
            apiUrl += `category=${category}&`;
        }
        if (updatedAfter) {
            apiUrl += `updatedAfter=${updatedAfter}&`;
        }
    }

    const fullData = [];

    async function fetchNextPage(url) {
        const response = await ofetch(url, {
            headers: {
                Authorization: `Token ${config.readwise.accessToken}`,
            },
        });

        fullData.push(...response.results);

        if (response.nextPageCursor) {
            await fetchNextPage(apiUrl + `pageCursor=${response.nextPageCursor}`);
        }
    }

    await fetchNextPage(apiUrl);

    const items = fullData
        .filter((item) => {
            if (!tag) {
                return true; // No tag filter applied
            }

            // Check if item.tags exist and match the criteria based on tagStrategy
            const itemTags = item.tags;

            if (!itemTags) {
                return false; // If item has no tags and tag filter is applied, exclude it
            }

            if (Array.isArray(tag)) {
                if (tagStrategy === TAG_STRATEGY_ANY) {
                    // Filter if any of the tags match
                    return tag.some((t) => Object.values(itemTags).some((tagObj) => tagObj.name === t));
                } else if (tagStrategy === TAG_STRATEGY_ALL) {
                    // Filter if all tags match
                    return tag.every((t) => Object.values(itemTags).some((tagObj) => tagObj.name === t));
                }
            } else {
                const tagName = tag;
                return Object.values(itemTags).some((tagObj) => tagObj.name === tagName);
            }

            return false;
        })
        .map((item) => ({
            title: item.title,
            link: item.source_url,
            description: item.summary,
            pubDate: parseDate(item.created_at),
            author: item.author,
        }));

    return {
        allowEmpty: true,
        title: 'Readwise Reader',
        link: 'https://read.readwise.io',
        item: items,
    };
}
