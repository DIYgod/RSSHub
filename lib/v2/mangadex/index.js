const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { RequestInProgressError } = require('@/errors');

module.exports = async (ctx) => {
    let data = (await got.get(`https://api.mangadex.org/manga/${ctx.params.id}`)).data;
    if (data.result === 'error') {
        throw new RequestInProgressError(data.errors[0].detail);
    }
    data = data.data;
    let title;
    if (ctx.params.lang) {
        title = data.attributes.title[ctx.params.lang];
        if (!title) {
            for (const altTitle of data.attributes.altTitles) {
                title = altTitle[ctx.params.lang];
                if (title) {
                    break;
                }
            }
        }
    }
    if (!title) {
        title = data.attributes.title[data.attributes.originalLanguage];
        if (!title) {
            for (const altTitle of data.attributes.altTitles) {
                title = altTitle[data.attributes.originalLanguage];
                if (title) {
                    break;
                }
            }
            if (!title) {
                title = Object.values(data.attributes.title)[0];
            }
        }
    }
    let description;
    if (ctx.params.lang) {
        description = data.attributes.description[ctx.params.lang];
    }
    if (!description) {
        description = data.attributes.description[data.attributes.originalLanguage];
        if (!description) {
            description = Object.values(data.attributes.description)[0];
        }
    }

    let url = `https://api.mangadex.org/manga/${ctx.params.id}/feed?order[publishAt]=desc`;
    if (ctx.params.lang) {
        url += `&translatedLanguage[]=${ctx.params.lang}`;
    }
    data = (await got.get(url)).data;
    if (data.result === 'error') {
        throw new RequestInProgressError(data.errors[0].detail);
    }
    ctx.state.data = {
        title: `${title} - MangaDex`,
        link: `https://mangadex.org/title/${ctx.params.id}`,
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
    if (ctx.params.lang) {
        ctx.state.data.language = ctx.params.lang;
    }
};
