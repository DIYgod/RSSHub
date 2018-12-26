const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const baseUrl = 'https://www.zaobao.com.sg';
const axios_ins = axios.create({
    headers: {
        Referer: baseUrl,
    },
});

module.exports = async (ctx) => {
    const type = ctx.params.type || 'greater-china';

    let info = '中港台';
    let word = '/znews/greater-china';

    if (type === 'singapore') {
        info = '新加坡';
        word = '/znews/singapore';
    } else if (type === 'international') {
        info = '国际';
        word = '/znews/international';
    } else if (type === 'sea') {
        info = '东南亚';
        word = '/znews/sea';
    } else if (type === 'sports') {
        info = '体育';
        word = '/znews/sports';
    }

    const response = await axios_ins.get(baseUrl + word);
    const $ = cheerio.load(response.data);
    const data = $('.row.list', '.post-list').find('.col-md-8.col-sm-8.col-xs-8.content');

    const resultItems = await Promise.all(
        data.toArray().map(async (item) => {
            const $item = $(item);
            const link = baseUrl + $item.find('a')[1].attribs.href;

            let resultItem = {};

            const value = await ctx.cache.get(link);

            if (value) {
                resultItem = JSON.parse(value);
            } else {
                const article = await axios_ins.get(link);
                const $1 = cheerio.load(article.data);
                const res = $1('.datestamp.date-published.meta-date-published', '.body-content')
                    .contents()
                    .text()
                    .replace('年', '-')
                    .replace('月', '-')
                    .replace('日', '');

                const date = res.replace('发布/', '').toString();
                let description = '';
                $1('p', '.article-content-container').each(function() {
                    description = description + '<p>' + $(this).html() + '</p>';
                });

                resultItem = {
                    title: $1('h1', '.body-content').text(),
                    description: description,
                    pubDate: new Date(date).toUTCString(),
                    link: link,
                };

                ctx.cache.set(link, JSON.stringify(resultItem), 24 * 60 * 60);
            }

            return Promise.resolve(resultItem);
        })
    );

    ctx.state.data = {
        title: `《联合早报》${info} 新闻`,
        link: baseUrl + word,
        description: '《联合早报》被公认是一份素质高、负责任、报道客观、言论公正、可信度高的报纸，对中国的发展采取积极的态度，在华人世界中享有崇高的信誉。',
        item: resultItems,
    };
};
