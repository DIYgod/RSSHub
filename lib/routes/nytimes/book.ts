// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

const categoryList = {
    'combined-print-and-e-book-nonfiction': '非虚构类 - 综合',
    'hardcover-nonfiction': '非虚构类 - 精装本',
    'paperback-nonfiction': '非虚构类 - 平装本',
    'advice-how-to-and-miscellaneous': '工具类',
    'combined-print-and-e-book-fiction': '虚构类 - 综合',
    'hardcover-fiction': '虚构类 - 精装本',
    'trade-fiction-paperback': '虚构类 - 平装本',
    'childrens-middle-grade-hardcover': '儿童 - 中年级',
    'picture-books': '儿童 - 绘本',
    'series-books': '儿童 - 系列图书',
    'young-adult-hardcover': '青少年',
};

export default async (ctx) => {
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
            .map((index, elem) => {
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
            })
            .get();
    }

    ctx.set('data', {
        title: `The New York Times Best Sellers - ${dataTitle}`,
        link: url,
        item: items,
    });
};
