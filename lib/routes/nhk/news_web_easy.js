const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { data } = await got.get('https://www3.nhk.or.jp/news/easy/news-list.json');
    const dates = JSON.parse(data.trim())[0];

    let items = [];
    for (const articles of Object.values(dates)) {
        for (const article of articles) {
            const date = new Date(article.news_prearranged_time);
            date.setHours(date.getHours() - 9); // Japan is +0900
            const pub_date_utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));

            items.push({
                title: article.title,
                description: `<h1>${article.title_with_ruby}</h1><img src="${article.news_web_image_uri}"/><br/>`,
                guid: article.news_id,
                pubDate: pub_date_utc.toUTCString(),
                link: `https://www3.nhk.or.jp/news/easy/${article.news_id}/${article.news_id}.html`,
            });
        }
    }

    items = items.sort((a, b) => b.pubDate - a.pubDate).slice(0, 10);

    const promises = [];
    const getDetail = async (item) => {
        const { data } = await got.get(item.link);
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
