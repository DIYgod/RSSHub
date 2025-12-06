import path from 'node:path';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

const getCategories = (tryGet) =>
    tryGet('4gamers:categories', async () => {
        const { data: response } = await got('https://www.4gamers.com.tw/site/api/news/category');

        return response.data.map((category) => ({
            id: category.id,
            name: category.name,
        }));
    });

const parseList = (results) =>
    results.map((item) => ({
        title: item.title,
        author: item.author.nickname,
        intro: item.intro,
        pubDate: parseDate(item.createPublishedAt, 'x'),
        link: item.canonicalUrl,
        category: [...new Set([item.category.name, ...item.tags])],
        articleId: item.id,
    }));

const parseItem = async (item) => {
    const { data: response } = await got('https://www.4gamers.com.tw/site/api/news/find-section', {
        searchParams: {
            sub: item.articleId,
        },
    });

    item.description = renderDescription(
        item.intro,
        response.data.contentSection.sections
            .map((section) => {
                switch (section['@type']) {
                    case 'ContentAdsSection':
                    case 'ScrollerAdsSection':
                    case 'textScrollerAdsSection':
                        return '';
                    case 'RawHtmlSection':
                        return section.html;
                    case 'ImageGroupSection':
                        return renderImages(section.items);
                    default:
                        throw new InvalidParameterError(`Unhandled section type: ${section['@type']} on ${item.link}`);
                }
            })
            .join('')
    );

    return item;
};

const renderDescription = (intro, content) =>
    art(path.join(__dirname, 'templates/description.art'), {
        intro,
        content,
    });
const renderImages = (images) =>
    art(path.join(__dirname, 'templates/image.art'), {
        images,
    });

export { getCategories, parseItem, parseList, renderDescription, renderImages };
