import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

const categoryList = {
    'combined-print-and-e-book-nonfiction': 'Combined Print & E-Book Nonfiction',
    'hardcover-nonfiction': 'Hardcover Nonfiction',
    'paperback-nonfiction': 'Paperback Nonfiction',
    'advice-how-to-and-miscellaneous': 'Advice, How-To & Miscellaneous',
    'combined-print-and-e-book-fiction': 'Combined Print & E-Book Fiction',
    'hardcover-fiction': 'Hardcover Fiction',
    'trade-fiction-paperback': 'Paperback Trade Fiction',
    'childrens-middle-grade-hardcover': "Children's Middle Grade Hardcover",
    'picture-books': 'Picture Books',
    'series-books': 'Series Books',
    'young-adult-hardcover': 'Young Adult Hardcover',
};

export const route: Route = {
    path: '/book/:category?',
    categories: ['traditional-media'],
    view: ViewType.Notifications,
    example: '/nytimes/book/combined-print-and-e-book-nonfiction',
    parameters: {
        category: {
            description: 'Category, can be found on the [official page](https://www.nytimes.com/books/best-sellers/)',
            options: Object.keys(categoryList).map((key) => ({
                value: key,
                label: categoryList[key],
            })),
            default: 'combined-print-and-e-book-nonfiction',
        },
    },
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
            source: ['nytimes.com/'],
            target: '',
        },
    ],
    name: 'Best Seller Books',
    maintainers: ['melvinto', 'pseudoyu'],
    handler,
    url: 'nytimes.com/',
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'combined-print-and-e-book-nonfiction';

    const url = `https://www.nytimes.com/books/best-sellers/${category}`;

    let items = [];
    let dataTitle = '';
    if (categoryList[category]) {
        const response = await got({
            method: 'get',
            url,
        });
        const data = response.data;
        const $ = load(data);
        dataTitle = $('h1').eq(0).text();

        items = $('article[itemprop=itemListElement]')
            .toArray()
            .map((elem, index) => {
                const $item = $(elem);
                const firstInfo = $item.find('p').eq(0).text();
                const $name = $item.find('h3[itemprop=name]');
                const author = $item.find('p[itemprop=author]').text();
                const publisher = $item.find('p[itemprop=publisher]').text();
                const description = $item.find('p[itemprop=description]').text();
                const imageLink = $item.find('img[itemprop=image]').attr('src');
                const $link = $item.find('ul[aria-label="Links to Book Retailers"]');
                const links = $link.find('a').toArray();

                let primaryLink = links.length > 0 ? $(links[0]).attr('href') : '';

                for (const link of links) {
                    const l = $(link);
                    if (l.text() === 'Amazon') {
                        primaryLink = l.attr('href');
                        break;
                    }
                }

                return {
                    title: `${index + 1}: ${$name.text()}`,
                    author,
                    description: `<figure><img src="${imageLink}" alt="test"/><figcaption><span>${description}</span></figcaption></figure><br/>${firstInfo}<br/>Author: ${author}<br/>Publisher: ${publisher}`,
                    link: primaryLink,
                };
            });
    }

    return {
        title: `The New York Times Best Sellers - ${dataTitle}`,
        link: url,
        item: items,
    };
}
