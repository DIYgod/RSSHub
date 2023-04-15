const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { RequestInProgressError } = require('@/errors');

module.exports = async (ctx) => {
    const { id, lang } = ctx.params;
    let data = (await got.get(`https://api.mangadex.org/manga/${id}`)).data;
    if (data.result === 'error') {
        throw new RequestInProgressError(data.errors[0].detail);
    }
    data = data.data;
    let title;
    if (lang) {
        title = data.attributes.title[lang];
        if (!title) {
            title = data.attributes.altTitles.find((altTitle) => altTitle[lang])?.[lang];
        }
    }
    if (!title) {
        title = data.attributes.title[data.attributes.originalLanguage];
        if (!title) {
            title = data.attributes.altTitles.find((altTitle) => altTitle[data.attributes.originalLanguage])?.[data.attributes.originalLanguage];
            if (!title) {
                title = Object.values(data.attributes.title)[0];
            }
        }
    }
    let description;
    if (lang) {
        description = data.attributes.description[lang];
    }
    if (!description) {
        description = data.attributes.description[data.attributes.originalLanguage];
        if (!description) {
            description = Object.values(data.attributes.description)[0];
        }
    }

    let url = `https://api.mangadex.org/manga/${id}/feed?order[publishAt]=desc`;
    if (lang) {
        url += `&translatedLanguage[]=${lang}`;
    }
    data = (await got.get(url)).data;
    if (data.result === 'error') {
        throw new RequestInProgressError(data.errors[0].detail);
    }
    ctx.state.data = {
        title: `${title} - MangaDex`,
        link: `https://mangadex.org/title/${id}`,
        description,
        allowEmpty: true,
        item: data.data.map((chapter) => {
            const title = [];
            if (chapter.attributes.volume) {
                title.push(`Vol. ${chapter.attributes.volume}`);
            }
            if (chapter.attributes.chapter) {
                title.push(`Ch. ${chapter.attributes.chapter}`);
            }
            if (chapter.attributes.title) {
                title.push(chapter.attributes.title);
            }
            return {
                title: title.join(' '),
                link: `https://mangadex.org/chapter/${chapter.id}`,
                pubDate: parseDate(chapter.attributes.publishAt),
            };
        }),
    };
    if (lang) {
        ctx.state.data.language = lang;
    }
};
