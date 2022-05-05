const got = require('@/utils/got');
const { topicDataHanding } = require('./utils');
const cheerio = require('cheerio');
const dayjs = require('dayjs');
const { constructTopicEntry } = require('@/v2/jike/utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const topicUrl = `https://m.okjike.com/topics/${id}`;

    const data = await constructTopicEntry(ctx, topicUrl);

    if (data) {
        ctx.state.data.item = topicDataHanding(data);
        if (id === '553870e8e4b0cafb0a1bef68' || id === '55963702e4b0d84d2c30ce6f') {
            ctx.state.data.item = await Promise.all(
                ctx.state.data.item.map(async (one) => {
                    const item = { ...one };
                    const regResult = /https:\/\/www\.okjike\.com\/medium\/[a-zA-Z0-9]*/.exec(item.description);
                    if (regResult) {
                        const newsUrl = regResult[0];
                        item.description = await ctx.cache.tryGet(newsUrl, async () => {
                            const { data } = await got(newsUrl);
                            const $ = cheerio.load(data);
                            const upper = $('ul.main > li.item');
                            const links = upper.find('a').map((_, ele) => $(ele).attr('href'));
                            const texts = upper.find('span.text').map((_, ele) => $(ele).text());
                            let description = '';
                            for (let i = 0; i < links.length; i++) {
                                description += `${i + 1}、<a href="${links[i]}">${texts[i]}</a><br>`;
                            }
                            description = description.replace(/<br>$/, '');
                            return description;
                        });
                    }
                    item.title = `${data.topic.content} ${dayjs(one.pubDate).format('MM月DD日')}`;
                    return item;
                })
            );
        }
    }
};
