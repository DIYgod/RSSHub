const indexInterview = (article, language) => {
    if (article.hasOwnProperty('index')) {
        return ogpImage(article) + article.ogpSettings.ogp.description + index(article, language);
    }
    return ogpImage(article);
};

const indexComic = (article, language) => ogpImage(article) + article.index.about + authors(article.index.authors) + `<img src="${article.indexCover.cover.sourceUrl}">` + index(article, language);

const indexNovel = (article, language) => ogpImage(article) + article.index.about + authors(article.index.authors) + `<img src="${article.indexCover.cover.sourceUrl}">` + index(article, language);

const interview = (article, language) => {
    if (article.hasOwnProperty('interviewContents')) {
        const leading = article.interviewContents.leading;

        let result = ogpImage(article) + linkToIndex(article, language) + '<hr/>' + (leading ? leading : '');
        for (const block of article.interviewContents.block) {
            result += `<h2 style="text-align: center;">${block.head}</h2>` + block.content;
        }
        return result;
    }

    return ogpImage(article) + linkToIndex(article, language);
};

const novel = (article, language) =>
    ogpImage(article) + linkToIndex(article, language) + `<hr/><img src="${article.novelContent.cover.sourceUrl}">` + authors(article.novelContent.authors) + freeEntry(article.novelContent.freeentry) + article.novelContent.contents;

const comic = (article, language) => {
    const viewerurl = article.comicContents.viewerurl;
    const niconicourl = article.comicContents.niconicourl;

    let result =
        ogpImage(article) +
        linkToIndex(article, language) +
        `<hr/><img src="${article.comicContents.cover.sourceUrl}">` +
        authors(article.comicContents.authors) +
        (viewerurl ? `<p>Viewer: <a href="${viewerurl}">${viewerurl}</a></p>` : '') +
        (niconicourl ? `<p>niconico: <a href="${niconicourl}">${niconicourl}</a></p>` : '') +
        freeEntry(article.comicContents.freeentry);
    for (const page of article.comicContents.pages) {
        result += `<img src="${page.page.sourceUrl}">`;
    }
    return result;
};

const uncategorized = (article, language) => ogpImage(article) + linkToIndex(article, language) + '<hr/>' + article.contents.texts;

/**
 * 生成超链接，并将 edit 替换为对应语言; 从 article.index.item 会有带 edit 的 url 进来
 */
const href = (text, url, language) => `<a href="${url.replace(/\/\/edit/, `//${language === 'ja' ? '' : language}`)}">${text}</a>`;

/**
 * 处理 authors
 */
const authors = (data) => {
    let result = '';
    for (const author of data) {
        result += `<p>${author.role}：${author.name}</p>`;
    }
    return result;
};

/**
 * 处理 freeentry
 */
const freeEntry = (data) => {
    let result = '';
    if (data) {
        for (const fe of data) {
            result += `<br/><h2>${fe.subject}</h2><p>${fe.contents}</p>`;
        }
    }
    return result;
};

/**
 * 处理 ogpSettings.ogp.image
 */
const ogpImage = (article) => `<img src="${article.ogpSettings.ogp.image.sourceUrl}"` + ` alt="${article.ogpSettings.ogp.image.altText}">`;

/**
 * 处理 linkToIndex
 */
const linkToIndex = (article, language) => {
    if (article.hasOwnProperty('linkToIndex') && article.linkToIndex.linktoindex !== null) {
        const index = article.linkToIndex.linktoindex;
        return `<p>Index：${href(index.title, index.url, language)}</p>`;
    }
    return '';
};

/**
 * 处理 index.item
 */
const index = (article, language) => {
    let result = '';
    for (const item of article.index.item) {
        result += `<hr/><p><b>${item.num}</b></p>` + (item.link ? href(item.title, item.link.url, language) : `<p>${item.title}</p>`) + `<p style="text-align: right;">${item.date}</p>`;
    }
    return result;
};

module.exports = {
    indexInterview,
    indexComic,
    indexNovel,
    interview,
    novel,
    comic,
    uncategorized,
};
