const axios = require('@/utils/axios');
const common = require('./common');
const cheerio = require('cheerio');
const dayjs = require('dayjs');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'post',
        url: 'https://app.jike.ruguoapp.com/1.0/messages/history',
        headers: {
            Referer: `https://m.okjike.com/topics/${id}`,
            'App-Version': '4.12.0',
        },
        data: {
            loadMoreKey: null,
            topic: id,
            limit: 10,
        },
    });

    const data = response.data.data;

    if (common.emptyResponseCheck(ctx, data)) {
        return;
    }

    const topic = data[0].topic;
    ctx.state.data = {
        title: `${topic.content} - 即刻主题精选`,
        link: `https://web.okjike.com/topic/${id}/official`,
        description: topic.content,
        image: topic.squarePicture.picUrl || topic.squarePicture.middlePicUrl || topic.squarePicture.thumbnailUrl,
        item: common.topicDataHanding(data),
    };
    if (id === '553870e8e4b0cafb0a1bef68' || id === '55963702e4b0d84d2c30ce6f') {
        const promises = ctx.state.data.item.map(async (one) => {
            const item = { ...one };
            const regResult = /https:\/\/www.okjike.com\/medium\/[a-zA-Z0-9]*/.exec(item.description);
            if (regResult) {
                const newsUrl = regResult[0];
                const cache = await ctx.cache.get(newsUrl);
                if (cache) {
                    item.description = cache;
                } else {
                    const { data } = await axios.get(newsUrl);
                    const $ = cheerio.load(data);
                    const upper = $('ul.main > li.item');
                    const links = upper.find('a').map((_, ele) => $(ele).attr('href'));
                    const texts = upper.find('span.text').map((_, ele) => $(ele).text());
                    let description = '';
                    for (let i = 0; i < links.length; i++) {
                        description += `${i + 1}、<a href="${links[i]}">${texts[i]}</a><br/>`;
                    }
                    if (description) {
                        item.description = description;
                        await ctx.cache.set(newsUrl, description);
                    }
                }
            }
            item.title = `${topic.content} ${dayjs(new Date(one.pubDate)).format('MM月DD日')}`;
            return item;
        });

        ctx.state.data.item = await Promise.all(promises);
    }
};
