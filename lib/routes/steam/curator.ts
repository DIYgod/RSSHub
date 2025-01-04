import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { getCurrentPath } from '@/utils/helpers';
import path from 'node:path';
import { art } from '@/utils/render';

const __dirname = getCurrentPath(import.meta.url);

export const route: Route = {
    path: '/curator/:id',
    categories: ['game'],
    example: '/steam/curator/34646096-80-Days',
    parameters: {
        id: "Steam curator id. It usually consists of a sereis of numbers and the curator's name.",
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
    maintainers: ['naremloa', 'fenx'],
    handler: async (ctx) => {
        const { id } = ctx.req.param();

        const url = `https://store.steampowered.com/curator/${id}`;
        const response = await ofetch(url);
        const $ = load(response);

        const items = await Promise.all(
            $('#RecommendationsRows .recommendation')
                .toArray()
                .slice(0, 1)
                .map((item) => {
                    const el = $(item);
                    const appTitle = el.find('img').attr('alt')!;
                    const appLink = el.find('.recommendation_link').first().attr('href');
                    const appImage = el.find('img').attr('src') ?? '';
                    const reviewContent = el.find('.recommendation_desc').text().trim();
                    const reviewDateText = el.find('.curator_review_date').text().trim();

                    const currentYearPattern = /,\s\b\d{4}\b$/;
                    const reviewPubDate = currentYearPattern.test(reviewDateText) ? parseDate(`${reviewDateText}, ${new Date().getFullYear()}`) : parseDate(reviewDateText);

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
                })
        );

        return {
            title: `Steam Curator ${id} Reviews`,
            link: url,
            item: items,
        };
    },
};
