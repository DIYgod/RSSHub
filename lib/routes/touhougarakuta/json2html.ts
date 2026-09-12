import { load } from 'cheerio';

const href = (text: string, url: string, language: string) => `<a href="${url.replace(/\/\/edit/, () => `//${language === 'ja' ? '' : language}`)}">${text}</a>`;

const authors = (data: any[]) => data?.map((author) => `<p>${author.role}：${author.name}</p>`).join('');

const freeEntry = (data: any[]) => (data ? data.map((fe) => `<br/><h2>${fe.subject}</h2><p>${fe.contents}</p>`).join('') : '');

const ogpImage = (article: any) => `<img src="${article.ogpSettings.ogp.image.sourceUrl}" alt="${article.ogpSettings.ogp.image.altText}">`;

const linkToIndex = (article: any, language: string) => {
    if (Object.hasOwn(article, 'linkToIndex') && article.linkToIndex.linktoindex !== null) {
        const index = article.linkToIndex.linktoindex;
        return `<p>Index：${href(index.title, index.url, language)}</p>`;
    }
    return '';
};

const index = (article: any, language: string) =>
    article.index.item.map((item: any) => `<hr/><p><b>${item.num}</b></p>` + (item.link ? href(item.title, item.link.url, language) : `<p>${item.title}</p>`) + `<p style="text-align: right;">${item.date}</p>`).join('');

export const indexInterview = (article: any, language: string) => (Object.hasOwn(article, 'index') ? ogpImage(article) + article.ogpSettings.ogp.description + index(article, language) : ogpImage(article));

export const indexComic = (article: any, language: string) => ogpImage(article) + article.index.about + authors(article.index.authors) + `<img src="${article.indexCover.cover.sourceUrl}">` + index(article, language);

export const indexNovel = indexComic;

const removeSrcset = (html: string) => {
    const $ = load(html, null, false);
    $('img').removeAttr('srcset');
    return $.html();
};

export const interview = (article: any, language: string) => {
    if (Object.hasOwn(article, 'interviewContents')) {
        const leading = article.interviewContents.leading;
        return (
            ogpImage(article) +
            linkToIndex(article, language) +
            '<hr/>' +
            (leading ? removeSrcset(leading) : '') +
            article.interviewContents.block.map((block: any) => `<h2 style="text-align: center;">${block.head}</h2>` + removeSrcset(block.content)).join('')
        );
    }
    return ogpImage(article) + linkToIndex(article, language);
};

export const novel = (article: any, language: string) =>
    ogpImage(article) +
    linkToIndex(article, language) +
    `<hr/><img src="${article.novelContent.cover.sourceUrl}">` +
    authors(article.novelContent.authors) +
    freeEntry(article.novelContent.freeentry) +
    removeSrcset(article.novelContent.contents);

export const comic = (article: any, language: string) => {
    const viewerurl = article.comicContents.viewerurl;
    const niconicourl = article.comicContents.niconicourl;

    return (
        ogpImage(article) +
        linkToIndex(article, language) +
        `<hr/><img src="${article.comicContents.cover.sourceUrl}">` +
        authors(article.comicContents.authors) +
        (viewerurl ? `<p>Viewer: <a href="${viewerurl}">${viewerurl}</a></p>` : '') +
        (niconicourl ? `<p>niconico: <a href="${niconicourl}">${niconicourl}</a></p>` : '') +
        freeEntry(article.comicContents.freeentry) +
        article.comicContents.pages.map((page: any) => `<img src="${page.page.sourceUrl}">`).join('')
    );
};

export const uncategorized = (article: any, language: string) => ogpImage(article) + linkToIndex(article, language) + '<hr/>' + removeSrcset(article.contents.texts);
