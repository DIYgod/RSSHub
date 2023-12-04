const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');

module.exports = async (ctx) => {
    let baseUrl, apiUrl;
    let title, description;
    let lang = ctx.params.lang;
    switch (lang) {
        case 'en':
            baseUrl = 'https://www.mclaren.com';
            title = 'McLaren Racing – Official Website';
            description = 'Latest news and insight from McLaren Racing. Team and driver updates, videos and McLaren Formula 1 LIVE commentary.';
            lang = 'en-UK';
            break;
        case 'zh':
            baseUrl = 'https://cn.mclaren.com';
            title = '迈凯伦赛车 — 官方网站';
            description = '来自迈凯伦一级方程式车队的最新消息。 查看车队和车手近况、视频以及比赛中的迈凯伦实况评论和实时数据。';
            lang = 'zh-CN';
            break;
        case 'es':
            baseUrl = 'https://es.mclaren.com';
            title = 'McLaren Racing - Sitio web oficial';
            description =
                'Consulta las últimas noticias del equipo de Fórmula 1 McLaren. Incluye información sobre el equipo, las últimas actualizaciones de los pilotos y McLaren LIVE, una aplicación con la que podrás seguir los comentarios en directo.';
            lang = 'es-ES';
            break;
        default:
            throw Error(`Language '${lang}' is not supported.`);
    }

    const { category = 'all' } = ctx.params;
    const categoryArr = ['all', 'article', 'report', 'gallery', 'video', 'blog', 'photo_essay'];
    if (!categoryArr.includes(category)) {
        throw Error(`Category '${category}' is not supported.`);
    }

    const link = baseUrl + '/racing/articles/';
    apiUrl = baseUrl + '/racing/api/grid-search/?count=30&offset=0&type=';
    // count: number of requested entries; default to 16, up to 30.
    // offset: default to 0.
    if (category !== 'all') {
        apiUrl += category;
    }

    const response = await got(apiUrl);

    const html = response.data.html;
    const $ = cheerio.load(html);
    const list = $('li')
        .toArray()
        .map((item) => {
            item = $(item);
            const thumbnailUrl = item.find('div.start-grid-content__img').attr('style').slice(22, -2);
            return {
                link: baseUrl + item.find('a.start-grid-content__link').attr('href'),
                thumbnailUrl, // Pass the thumbnail image
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const itemRep = await got(item.link);
                const $ = cheerio.load(itemRep.data);
                $('.livestream--wrapper').last().remove();
                item.title = $('meta[property="og:title"]').attr('content').slice(17);
                item.pubDate = Date.parse($('time[datetime]').first().attr('datetime'));
                const artParams = {
                    desc: $('meta[property="og:description"]').attr('content'),
                    heroUrl: $('meta[property="og:image"]').attr('content'),
                    videoId: $('a[data-video-id]').attr('data-video-id'),
                };
                $('.meta--hold, .show-for-small').remove();
                artParams.content = $('div.article-body').html();
                item.description = art(path.join(__dirname, 'templates/desc.art'), artParams);
                item.media = {
                    thumbnail: {
                        url: item.thumbnailUrl,
                    },
                };
                return item;
            })
        )
    );

    ctx.state.data = {
        language: lang,
        title,
        description,
        link,
        item: items,
    };
};
