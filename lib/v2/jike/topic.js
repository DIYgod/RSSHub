const got = require('@/utils/got');
const common = require('./common');
const cheerio = require('cheerio');
const dayjs = require('dayjs');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got(`https://m.okjike.com/topics/${id}`);

    const html = response.data;
    const $ = cheerio.load(html);
    const raw = $('[type = "application/json"]').html();
    const data = JSON.parse(raw).props.pageProps;

    if (common.emptyResponseCheck(ctx, data)) {
        return;
    }

    const topic = data.topic;
    ctx.state.data = {
        title: `${topic.content} - 即刻圈子`,
        link: `https://m.okjike.com/topics/${id}`,
        description: topic.briefIntro,
        image: topic.squarePicture.picUrl || topic.squarePicture.middlePicUrl || topic.squarePicture.thumbnailUrl,
        item: common.topicDataHanding(data),
    };
    if (id === '553870e8e4b0cafb0a1bef68' || id === '55963702e4b0d84d2c30ce6f') {
        const promises = ctx.state.data.item.map((one) => {
            const item = { ...one };
            const regResult = /https:\/\/www\.okjike\.com\/medium\/[a-zA-Z0-9]*/.exec(item.description);
            if (regResult) {
                const newsUrl = regResult[0];
                item.description = ctx.cache.tryGet(newsUrl, async () => {
                    const { data } = await got(newsUrl);
                    const $ = cheerio.load(data);
                    const upper = $('ul.main > li.item');
                    const links = upper.find('a').map((_, ele) => $(ele).attr('href'));
                    const texts = upper.find('span.text').map((_, ele) => $(ele).text());
                    let description = '';
                    for (let i = 0; i < links.length; i++) {
                        description += `${i + 1}、<a href="${links[i]}">${texts[i]}</a><br>`;
                    }
                    return description;
                });
            }
            item.title = `${topic.content} ${dayjs(one.pubDate).format('MM月DD日')}`;
            return item;
        });

        ctx.state.data.item = await Promise.all(promises);
    }
};
