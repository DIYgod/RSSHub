import NotFoundError from '@/errors/types/not-found';
import type { Data, Route } from '@/types';

import { getData, getList } from './utils';

export const route: Route = {
    path: '/topic/:topic',
    categories: ['new-media'],
    example: '/grist/topic/extreme-heat',
    parameters: { topic: 'Any Topic from Table below' },
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
            source: ['grist.org/accountability/'],
            target: '/topic/accountability',
        },
        {
            source: ['grist.org/buildings/'],
            target: '/topic/buildings',
        },
        {
            source: ['grist.org/business/'],
            target: '/topic/business',
        },
        {
            source: ['grist.org/cities/'],
            target: '/topic/cities',
        },
        {
            source: ['grist.org/climate-energy/climate/'],
            target: '/topic/climate',
        },
        {
            source: ['grist.org/climate-energy/'],
            target: '/topic/climate-energy',
        },
        {
            source: ['grist.org/climate-fiction/'],
            target: '/topic/climate-fiction',
        },
        {
            source: ['grist.org/climate-of-courage/'],
            target: '/topic/climate-of-courage',
        },
        {
            source: ['grist.org/cop26/'],
            target: '/topic/cop26',
        },
        {
            source: ['grist.org/cop27/'],
            target: '/topic/cop27',
        },
        {
            source: ['grist.org/cop28/'],
            target: '/topic/cop28',
        },
        {
            source: ['grist.org/cop29/'],
            target: '/topic/cop29',
        },
        {
            source: ['grist.org/cop30/'],
            target: '/topic/cop30',
        },
        {
            source: ['grist.org/culture/'],
            target: '/topic/culture',
        },
        {
            source: ['grist.org/extreme-weather/drought/'],
            target: '/topic/drought',
        },
        {
            source: ['grist.org/economics/'],
            target: '/topic/economics',
        },
        {
            source: ['grist.org/politics/elections/'],
            target: '/topic/elections',
        },
        {
            source: ['grist.org/energy/'],
            target: '/topic/energy',
        },
        {
            source: ['grist.org/equity/'],
            target: '/topic/equity',
        },
        {
            source: ['grist.org/extreme-weather/extreme-heat/'],
            target: '/topic/extreme-heat',
        },
        {
            source: ['grist.org/extreme-weather/'],
            target: '/topic/extreme-weather',
        },
        {
            source: ['grist.org/fix-articles/'],
            target: '/topic/fix-articles',
        },
        {
            source: ['grist.org/food-and-agriculture/'],
            target: '/topic/food-and-agriculture',
        },
        {
            source: ['grist.org/georgia-psc/'],
            target: '/topic/georgia-psc',
        },
        {
            source: ['grist.org/indigenous/global-indigenous-affairs-desk/'],
            target: '/topic/global-indigenous-affairs-desk',
        },
        {
            source: ['grist.org/grist/'],
            target: '/topic/grist',
        },
        {
            source: ['grist.org/grist-events/'],
            target: '/topic/grist-events',
        },
        {
            source: ['grist.org/grist-news/'],
            target: '/topic/grist-news',
        },
        {
            source: ['grist.org/video/grist-video/'],
            target: '/topic/grist-video',
        },
        {
            source: ['grist.org/health/'],
            target: '/topic/health',
        },
        {
            source: ['grist.org/housing/'],
            target: '/topic/housing',
        },
        {
            source: ['grist.org/indigenous/'],
            target: '/topic/indigenous',
        },
        {
            source: ['grist.org/international/'],
            target: '/topic/international',
        },
        {
            source: ['grist.org/justice/'],
            target: '/topic/justice',
        },
        {
            source: ['grist.org/labor/'],
            target: '/topic/labor',
        },
        {
            source: ['grist.org/language/'],
            target: '/topic/language',
        },
        {
            source: ['grist.org/migration/'],
            target: '/topic/migration',
        },
        {
            source: ['grist.org/oceans/'],
            target: '/topic/oceans',
        },
        {
            source: ['grist.org/opinion/'],
            target: '/topic/opinion',
        },
        {
            source: ['grist.org/politics/'],
            target: '/topic/politics',
        },
        {
            source: ['grist.org/protest/'],
            target: '/topic/protest',
        },
        {
            source: ['grist.org/race/'],
            target: '/topic/race',
        },
        {
            source: ['grist.org/regulation/'],
            target: '/topic/regulation',
        },
        {
            source: ['grist.org/science/'],
            target: '/topic/science',
        },
        {
            source: ['grist.org/shift-happens/'],
            target: '/topic/shift-happens',
        },
        {
            source: ['grist.org/solutions/'],
            target: '/topic/solutions',
        },
        {
            source: ['grist.org/spanish/'],
            target: '/topic/spanish',
        },
        {
            source: ['grist.org/sponsored/'],
            target: '/topic/sponsored',
        },
        {
            source: ['grist.org/technology/'],
            target: '/topic/technology',
        },
        {
            source: ['grist.org/temperature-check/'],
            target: '/topic/temperature-check',
        },
        {
            source: ['grist.org/cities/transportation/'],
            target: '/topic/transportation',
        },
        {
            source: ['grist.org/article/'],
            target: '/topic/article',
        },
        {
            source: ['grist.org/updates/'],
            target: '/topic/updates',
        },
        {
            source: ['grist.org/video/'],
            target: '/topic/video',
        },
        {
            source: ['grist.org/extreme-weather/wildfires/'],
            target: '/topic/wildfires',
        },
        {
            source: ['grist.org/language/words-of-the-year/'],
            target: '/topic/words-of-the-year',
        },
    ],
    name: 'Topic',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'grist.org/articles/',
    description: `Topics from the official category API. Use the category slug as \`topic\`.

| Topic Name                     | Topic Slug                     |
| ------------------------------ | ------------------------------ |
| Accountability                 | accountability                 |
| Ask Umbra                      | ask-umbra-series               |
| Buildings                      | buildings                      |
| Business                       | business                       |
| Cities                         | cities                         |
| Climate                        | climate                        |
| Climate & Energy               | climate-energy                 |
| Climate Fiction                | climate-fiction                |
| Climate of Courage             | climate-of-courage             |
| Community Engagement           | community-engagement           |
| COP26                          | cop26                          |
| COP27                          | cop27                          |
| COP28                          | cop28                          |
| COP29                          | cop29                          |
| COP30                          | cop30                          |
| Culture                        | culture                        |
| Drought                        | drought                        |
| Economics                      | economics                      |
| Elections                      | elections                      |
| Energy                         | energy                         |
| Equity                         | equity                         |
| Extreme Heat                   | extreme-heat                   |
| Extreme Weather                | extreme-weather                |
| Fix                            | fix                            |
| fix-articles                   | fix-articles                   |
| Food and Agriculture           | food-and-agriculture           |
| Georgia PSC                    | georgia-psc                    |
| Global Indigenous Affairs Desk | global-indigenous-affairs-desk |
| Grist                          | grist                          |
| Grist Events                   | grist-events                   |
| Grist News                     | grist-news                     |
| Grist Original Videos          | grist-video                    |
| Health                         | health                         |
| Housing                        | housing                        |
| Indigenous Affairs             | indigenous                     |
| International                  | international                  |
| Justice                        | justice                        |
| Labor                          | labor                          |
| Language                       | language                       |
| Migration                      | migration                      |
| Oceans                         | oceans                         |
| Opinion                        | opinion                        |
| Politics                       | politics                       |
| Protest                        | protest                        |
| Race                           | race                           |
| Regulation                     | regulation                     |
| Science                        | science                        |
| Shift Happens Newsletter       | shift-happens                  |
| Solutions                      | solutions                      |
| Spanish                        | spanish                        |
| Sponsored                      | sponsored                      |
| Technology                     | technology                     |
| Temperature Check              | temperature-check              |
| Transportation                 | transportation                 |
| Uncategorized                  | article                        |
| Updates                        | updates                        |
| Video                          | video                          |
| Wildfires                      | wildfires                      |
| Words of the Year              | words-of-the-year              |`,
};

async function handler(ctx): Promise<Data> {
    const baseUrl = 'https://grist.org';
    const searchRoute = '/wp-json/wp/v2/categories?slug=';
    const articleRoute = '/wp-json/wp/v2/posts?categories=';
    const topic = ctx.req.param('topic');
    const topicData = (await getData(`${baseUrl}${searchRoute}${encodeURIComponent(topic)}`))[0];
    if (!topicData) {
        throw new NotFoundError(`Grist did not return a topic for '${topic}'. Check the topic slug in the source URL.`);
    }
    const id = topicData.id;
    const data = await getData(`${baseUrl}${articleRoute}${id}&_embed`);
    const items = await getList(data);

    return {
        title: `${topicData.name} - Grist Articles`,
        link: topicData.link,
        item: items,
        description: `${topicData.name} Articles on grist.org`,
        logo: 'https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=192',
        icon: 'https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=32',
        language: 'en-us',
    };
}
