const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const path = require('path');
const { art } = require('@/utils/render');

module.exports = async (ctx) => {
    const { lang = 'ja' } = ctx.params;
    const data = await got(`https://sv-news.pokemon.co.jp/${lang}/json/list.json`, {
        method: 'get',
    });

    let titleText = '';

    switch (lang) {
        case 'ja':
            titleText = 'お知らせ';
            break;
        case 'en':
            titleText = 'News';
            break;
        case 'fr':
            titleText = 'Actualités';
            break;
        case 'it':
            titleText = 'Novità';
            break;
        case 'de':
            titleText = 'Neuigkeiten';
            break;
        case 'es':
            titleText = 'Noticias';
            break;
        case 'ko':
            titleText = '소식';
            break;
        case 'sc':
            titleText = '公告';
            break;
        case 'tc':
            titleText = '公告';
            break;
        default:
            break;
    }

    const res = data.data.data;

    const items = res.map((item) => ({
        title: item.title,
        link: `https://sv-news.pokemon.co.jp/${lang}/${item.link}`,
        category: item.kindTxt,
        description: art(path.join(__dirname, '../templates/news.art'), {
            image: `https://sv-news.pokemon.co.jp/${lang}/${item.banner}`,
        }),
        pubDate: parseDate(new Date(Number(item.stAt, 10) * 1000).toUTCString()),
    }));

    ctx.state.data = {
        title: titleText,
        link: `https://sv-news.pokemon.co.jp/${lang}/list`,
        image: `https://sv-news.pokemon.co.jp/resources/image/Favicon_TitanNews.png`,
        item: items,
    };
};
