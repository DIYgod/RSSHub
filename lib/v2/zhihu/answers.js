const got = require('@/utils/got');
const utils = require('./utils');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const headers = {
        'User-Agent': 'ZhihuHybrid com.zhihu.android/Futureve/6.59.0 Mozilla/5.0 (Linux; Android 10; GM1900 Build/QKQ1.190716.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/85.0.4183.127 Mobile Safari/537.36',
        Referer: `https://www.zhihu.com/people/${id}/answers`,
    };

    const response = await got({
        method: 'get',
        url: `https://api.zhihu.com/people/${id}/answers?order_by=created&offset=0&limit=10`,
        headers,
    });

    const data = response.data.data;
    let name = data[0].author.name;

    if (name === '知乎用户') {
        const info = await got({
            method: 'get',
            url: `https://www.zhihu.com/api/v4/members/${id}/activities?limit=1`,
            headers: {
                ...utils.header,
                Referer: `https://www.zhihu.com/people/${id}/activities`,
                Authorization: 'oauth c3cef7c66a1843f8b3a9e6a1e3160e20', // hard-coded in js
            },
        });
        name = info.data.data[0].actor.name;
    }

    const items = await Promise.all(
        data.map(async (item) => {
            let description;
            const link = `https://www.zhihu.com/question/${item.question.id}/answer/${item.id}`;
            const title = item.question.title;
            try {
                const detail = await got({
                    method: 'get',
                    url: `https://api.zhihu.com/appview/api/v4/answers/${item.id}?include=content&is_appview=true`,
                    headers,
                });
                description = utils.ProcessImage(detail.data.content);
            } catch (e) {
                description = `<a href="${link}" target="_blank">${title}</a>`;
            }
            return {
                title,
                description,
                pubDate: parseDate(item.created_time * 1000),
                link,
            };
        })
    );

    ctx.state.data = {
        title: `${name}的知乎回答`,
        link: `https://www.zhihu.com/people/${id}/answers`,
        item: items,
    };
};
