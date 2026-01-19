import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { toTitleCase } from '@/utils/common-utils';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/mayors-office-news/:types?/:categories?',
    name: "Mayor's Office News",
    maintainers: ['hkamran80'],
    categories: ['government'],
    example: '/nyc/mayors-office-news/executive-orders/civic-services',
    parameters: {
        types: { description: 'a comma-separated list of news types. Options: see table.', default: 'all' },
        categories: { description: 'a comma-separated list of categories. Options: see table.', default: 'all' },
    },
    description: `Types

| Type                | Slug                |
| ------------------- | ------------------- |
| Press releases      | press-releases      |
| Executive orders    | executive-orders    |
| Public schedule     | public-schedule     |
| Audio               | audio               |
| Statements          | statements          |
| Designation letters | designation-letters |
| Images              | images              |
| Video               | video               |
| All                 | all                 |

Categories

| Category                | Slug                |
| ----------------------- | ------------------- |
| Business                | business            |
| Culture and recreation  | culture-recreation  |
| Environment             | environment         |
| Housing and development | housing-development |
| Social services         | social-services     |
| Civic services          | civic-services      |
| Education               | education           |
| Health                  | health              |
| Public safety           | public-safety       |
| Transportation          | transportation      |
| All                     | all                 |`,
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['nyc.gov', 'nyc.gov/mayors-office', 'nyc.gov/mayors-office/news/', 'nyc.gov/mayors-office/news/*'],
        },
    ],
    handler: async (ctx) => {
        const { types: typesParam = 'all', categories: categoriesParam = 'all' } = ctx.req.param();
        const types = typesParam === 'all' ? '' : typesParam;
        const categories = categoriesParam === 'all' ? '' : categoriesParam;

        const baseUrl = 'https://www.nyc.gov';

        const data = await ofetch(`https://www.nyc.gov/bin/nyc/articlesearch.json?pageSize=10&currentPage=1&types=${types}&categories=${categories}`);
        const list = data.results.map((item) => {
            const imageUrl = item.articleImage ? baseUrl + item.articleImage : undefined;
            const imageExtension = item.articleImage ? item.articleImage.split('.')[1] : undefined;

            return {
                title: item.title,
                link: baseUrl + item.link.replace('.html', ''),
                pubDate: timezone(parseDate(item.articleDate), -5),
                media: item.articleImage ? { content: { url: imageUrl, type: `image/${imageExtension === 'jpg' ? 'jpeg' : imageExtension}` }, thumbnail: { url: imageUrl } } : undefined,
            };
        });

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);

                    // Remove "Media Contact" banner
                    $('.teaser').remove();

                    // Remove `iframe` (e.g. YouTube embeds)
                    $('iframe').remove();

                    item.description = $('#body-text-section').first().html();

                    return item;
                })
            )
        );

        const cleanedTypes = types.replaceAll(',', ', ').replaceAll('-', ' ');
        const fixedCategories = categories
            .split(',')
            .map((category) => fixCategoryName(category))
            .join(', ')
            .replaceAll('-', ' ');

        // Title
        let title = '';
        if (types) {
            title = spacedToTitleCase(cleanedTypes);
        }

        if (categories) {
            title = types ? `${title} (` : 'All (';
            title = `${title}${spacedToTitleCase(fixedCategories)})`;
        }

        // Description
        let description = '';
        description = types ? toTitleCase(cleanedTypes) : 'News';

        if (categories) {
            description = `${description} categorized as ${fixedCategories}`;
        }

        // Link
        let link = 'https://www.nyc.gov/mayors-office/news/?';
        if (types) {
            link = `${link}types=${types.replaceAll(',', '&types=')}`;
        }

        if (categories) {
            if (types) {
                link = `${link}&`;
            }
            link = `${link}categories=${categories.replaceAll(',', '&categories=')}`;
        }

        return {
            title: `${title ? title + ' | ' : ''}NYC Mayor's Office News`,
            description: `${description} from the NYC Office of the Mayor`,
            link,
            item: items,
        };
    },
};

const fixCategoryName = (categoryName: string) => (categoryName === 'housing-development' || categoryName === 'culture-recreation' ? categoryName.replace('-', ' and ') : categoryName);

const spacedToTitleCase = (s: string) =>
    s
        .split(' ')
        .map((part) => toTitleCase(part))
        .join(' ');
