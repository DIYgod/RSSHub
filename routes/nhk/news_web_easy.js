const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { data } = await axios.get('https://www3.nhk.or.jp/news/easy/news-list.json');
    const dates = JSON.parse(data.trim())[0];

    let items = [];
    for (const articles of Object.values(dates)) {
        for (const article of articles) {
            items.push({
                title: article.title,
                description: `<h1>${article.title_with_ruby}</h1><img referrerpolicy="no-referrer" src="${article.news_web_image_uri}"/><br/>`,
                guid: article.news_id,
                pubDate: new Date(article.news_publication_time).toUTCString(),
                link: `https://www3.nhk.or.jp/news/easy/${article.news_id}/${article.news_id}.html`,
            });
        }
    }

    items = items.sort((a, b) => b.pubDate - a.pubDate).slice(0, 10);

    const promises = [];
    const getDetail = async (item) => {
        const { data } = await axios.get(item.link);
        const $ = cheerio.load(data);
        item.description += $('.article-body').html();
    };
    for (const item of items) {
        promises.push(getDetail(item));
    }
    await Promise.all(promises);

    ctx.state.data = {
        title: 'NEWS WEB EASY',
        link: 'https://www3.nhk.or.jp/news/easy/',
        description: 'NEWS WEB EASYは、小学生・中学生の皆さんや、日本に住んでいる外国人のみなさんに、わかりやすいことば　でニュースを伝えるウェブサイトです。',
        item: items,
    };
};
