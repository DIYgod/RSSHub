import { load } from 'cheerio';

import got from '@/utils/got';

export const getDetails = async (link) => {
    // Article selector.
    const articleSelector = 'article.g-main-video-article';
    // Detail selectors.
    const thumbnailSelector = 'header > figure.video-figure > a ';
    const titleSelector = 'header > h1.video-h1 ';
    const authorSelector = 'section:nth-child(4) > a > div.video-center';
    const originsSelector = 'section:nth-child(5) > a > div.video-center';
    const charactersSelector = 'section:nth-child(6) > a > div.video-center';
    const tagsSelector = 'section:nth-child(7) > ul > li > a div.tag-text'; // Tag selector.
    const descriptionSelector = 'section blockquote.video-information-comment';
    const iwaraSelector = 'header > figure.video-figure > a';
    // Fetch the article.
    const response = await got(link);
    const $ = load(response.data);
    // Extract article details.
    const thumbnailUrl = $(thumbnailSelector).find('img').attr('src');
    const videoTitle = $(titleSelector).text();
    // Read taxonomy labels.
    const authors = $(articleSelector)
        .find(authorSelector)
        .toArray()
        .map((el) => $(el).text());
    const origins = $(articleSelector)
        .find(originsSelector)
        .toArray()
        .map((el) => $(el).text().trim());
    const characters = $(articleSelector)
        .find(charactersSelector)
        .toArray()
        .map((el) => $(el).text().trim());
    const tags = $(articleSelector)
        .find(tagsSelector)
        .toArray()
        .map((el) => $(el).text());
    // Extract article details.
    const desc = $(articleSelector).find(descriptionSelector).text();
    const iwaraUrl = $(iwaraSelector).attr('href');
    // Return the parsed details.
    return {
        thumbnailUrl,
        videoTitle,
        authors: authors.join(' '),
        origins: origins.join(' '),
        characters: characters.join(' '),
        tagList: tags,
        desc,
        iwaraUrl,
        articleLink: link,
    };
};
