import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['programming'],
    example: '/smashingmagazine/react',
    parameters: { category: 'Find in URL or Table below' },
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
            source: ['smashingmagazine.com/category/:category'],
            target: '/:category',
        },
    ],
    name: 'Category',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'smashingmagazine.com/articles/',
    description: `| **Category**       |                    |
  | ------------------ | ------------------ |
  | Accessibility      | accessibility      |
  | Best practices     | best-practices     |
  | Business           | business           |
  | Career             | career             |
  | Checklists         | checklists         |
  | CSS                | css                |
  | Data Visualization | data-visualization |
  | Design             | design             |
  | Design Patterns    | design-patterns    |
  | Design Systems     | design-systems     |
  | E-Commerce         | e-commerce         |
  | Figma              | figma              |
  | Freebies           | freebies           |
  | HTML               | html               |
  | Illustrator        | illustrator        |
  | Inspiration        | inspiration        |
  | JavaScript         | javascript         |
  | Mobile             | mobile             |
  | Performance        | performance        |
  | Privacy            | privacy            |
  | React              | react              |
  | Responsive Design  | responsive-design  |
  | Round-Ups          | round-ups          |
  | SEO                | seo                |
  | Typography         | typography         |
  | Tools              | tools              |
  | UI                 | ui                 |
  | Usability          | usability          |
  | UX                 | ux                 |
  | Vue                | vue                |
  | Wallpapers         | wallpapers         |
  | Web Design         | web-design         |
  | Workflow           | workflow           |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const baseUrl = 'https://www.smashingmagazine.com';
    const route = category ? `/category/${category}` : '/articles';
    const { data: response } = await got(`${baseUrl}${route}`);
    const $ = load(response);

    const listItems = $('article.article--post')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('h2.article--post__title a');
            const description = item.find('p.article--post__teaser').clone().children().remove().end().text();
            const author = item.find('span.article--post__author-name a').text();
            const time = $('p.article--post__teaser time').attr('datetime');
            const pubDate = parseDate(time, 'YYYY-MM-DD');
            return {
                title: a.text(),
                link: `${baseUrl}${a.attr('href')}`,
                pubDate,
                description,
                author,
            };
        });

    const items = await Promise.all(
        listItems.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                item.category = $('li.meta-box--tags a')
                    .toArray()
                    .map((item) => $(item).text());
                const header = $('div#article__content header.article-header').clone().children('ul').remove().end().html();
                const summary = $('div#article__content section.article__summary').html();
                const descr = $('div#article__content div.c-garfield-the-cat')
                    .clone()
                    .children('div')
                    .remove()
                    .end()
                    .toArray()
                    .map((element) => $(element).html());
                item.description = [header, summary, ...descr].join('');

                return item;
            })
        )
    );

    return {
        title: 'Smashing Magazine Articles',
        link: `${baseUrl}${route}`,
        item: items,
        description: 'Latest Articles on Smashingmagazine.com',
        logo: 'https://www.smashingmagazine.com/images/favicon/apple-touch-icon.png',
        icon: 'https://www.smashingmagazine.com/images/favicon/favicon.svg',
        language: 'en-us',
    };
}
