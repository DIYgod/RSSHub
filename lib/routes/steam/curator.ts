import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { getCurrentPath } from '@/utils/helpers';
import path from 'node:path';
import { art } from '@/utils/render';

const __dirname = getCurrentPath(import.meta.url);

export const route: Route = {
    path: '/curator/:id/:routeParams?',
    categories: ['game'],
    example: '/steam/curator/34646096-80-Days',
    parameters: {
        id: "Steam curator id. It usually consists of a series of numbers and the curator's name.",
        routeParams: {
            description: `Extra parameters to filter the reviews. The following parameters are supported:
| Key             | Description                                                                                   | Accepts                                    | Defaults to |
| --------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------- |
| \`curations\`   | Review type to filter by. \`0\`: Recommended, \`1\`: Not Recommended, \`2\`: Informational    | \`0\`/\`1\`/\`2\`/\`0,1\`/\`0,2\`/\`1,2\`  |             |
| \`tagids\`      | Tag to filter by. Details are provided below.                                                 | use comma to separate multiple tagid       |             |

Note: There is a [‘Popular Tags’](https://store.steampowered.com/tag/browse) page where you can find many but not all of the tags. The tag’s ID is in the \`data-tagid\` attribute of the element.Steam does not currently provide a page that comprehensively lists all tags, and you may need to explore alternative ways to find them.

Examples:
* \`/steam/curator/34646096-80-Days/curations=&tagids=\`
* \`/steam/curator/34646096-80-Days/curations=0&tagids=19\`
* \`/steam/curator/34646096-80-Days/curations=0,2&tagids=19,21\`
`,
        },
    },
    radar: [
        {
            title: 'Latest Curator Reviews',
            source: ['store.steampowered.com/curator/:id'],
            target: '/curator/:id',
        },
    ],
    description: 'The Latest reviews from a Steam Curator.',
    name: 'Latest Curator Reviews',
    maintainers: ['naremloa', 'fenxer'],
    handler: async (ctx) => {
        const { id, routeParams } = ctx.req.param();
        const params = new URLSearchParams(routeParams);

        const url = new URL(`https://store.steampowered.com/curator/${id}/ajaxgetfilteredrecommendations/?query&start=0&count=10&dynamic_data=&sort=recent&app_types=&reset=false&curations=&tagids=`);
        for (const [key, value] of params) {
            if (['curations', 'tagids'].includes(key)) {
                url.searchParams.set(key, value || '');
            }
        }

        const response = await ofetch(url.toString());
        const $ = load(response.results_html ?? '');

        const items = $('.recommendation')
            .toArray()
            .map((item) => {
                const el = $(item);
                const appImageEl = el.find('a.store_capsule img');
                const appTitle = appImageEl.attr('alt')!;
                const appImage = appImageEl.attr('src') ?? '';
                const appLink = el.find('.recommendation_link').first().attr('href');
                const reviewContent = el.find('.recommendation_desc').text().trim();
                const reviewDateText = el.find('.curator_review_date').text().trim();

                const notCurrentYearPattern = /,\s\b\d{4}\b$/;
                const reviewPubDate = notCurrentYearPattern.test(reviewDateText) ? parseDate(reviewDateText) : parseDate(`${reviewDateText}, ${new Date().getFullYear()}`);

                const description = art(path.join(__dirname, 'templates/curator-description.art'), { image: appImage, description: reviewContent });

                return {
                    title: appTitle,
                    link: appLink,
                    description,
                    pubDate: reviewPubDate,
                    media: {
                        content: {
                            url: appImage,
                            medium: 'image',
                        },
                    },
                };
            });

        return {
            title: `Steam Curator ${id} Reviews`,
            link: url.toString(),
            item: items,
        };
    },
};
