const got = require('@/utils/got');

const sourceTimezoneOffset = -8;
module.exports = async (ctx) => {
    const id_url = 'https://sportsnba.qq.com/news/index?column=banner';
    const articles = await got.get(id_url);
    const articleIds = articles.data.data.map((article) => article.id);

    const url = 'https://sportsnba.qq.com/news/item?column=banner&articleIds=' + articleIds.toString();
    const response = await got.get(url);
    const xmls = response.data.data;
    const out = Object.keys(xmls).map((xml) => {
        const data = xmls[xml];
        const link = data.shareUrl;

        const guid = data.newsId;
        const title = data.title;
        const time = new Date(data.pub_time);
        time.setTime(time.getTime() + (sourceTimezoneOffset - time.getTimezoneOffset() / 60) * 60 * 60 * 1000);
        const pubDate = time.toUTCString();

        const description = '<img src="' + data.imgurl + '">';

        const item = {
            title,
            description,
            pubDate,
            link,
            guid,
        };

        return item;
    });

    ctx.state.data = {
        title: 'NBA - news',
        link: 'https://kbsapp.sports.qq.com',
        item: out,
    };
};
