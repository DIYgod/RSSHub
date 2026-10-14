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
    // Prepare detail fields.
    const tags: string[] = [];
    const authors: string[] = [];
    const origins: string[] = [];
    const characters: string[] = [];
    // Extract article details.
    const thumbnailHref = $(thumbnailSelector).find('img').attr('src');
    const thumbnailUrl = thumbnailHref ? new URL(thumbnailHref, link).href : undefined;
    const videoTitle = $(titleSelector).text();
    // Read taxonomy labels.
    $(articleSelector)
        .find(authorSelector)
        .each((i, el) => {
            authors[i] = $(el).text().trim();
        });
    $(articleSelector)
        .find(originsSelector)
        .each((i, el) => {
            origins[i] = $(el).text().trim();
        });
    $(articleSelector)
        .find(charactersSelector)
        .each((i, el) => {
            characters[i] = $(el).text().trim();
        });
    $(articleSelector)
        .find(tagsSelector)
        .each((i, el) => {
            tags[i] = $(el).text().trim();
        });
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
        tags: tags.join(' '),
        tagList: tags.map((tag) => tag.trim()).filter(Boolean),
        desc,
        iwaraUrl,
        articleLink: link,
    };
};
