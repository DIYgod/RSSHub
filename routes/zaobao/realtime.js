const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const baseUrl = 'https://www.zaobao.com.sg';
const host = 'https://www.zaobao.com.sg/realtime';
const axios_ins = axios.create({
    headers: {
        Referer: host,
    },
});

module.exports = async (ctx) => {
    const type = ctx.params.type || 'china';

    let info = '中港台';
    let word = '/realtime/china';
    let div = 'div#CN.list-sect-sub';
    if (type === '2') {
        info = 'singapore';
        word = '/realtime/singapore';
        div = 'div#SG.list-sect-sub';
    } else if (type === 'world') {
        info = '国际';
        word = '/realtime/world';
        div = 'div#Global.list-sect-sub';
    } else if (type === 'zfinance') {
        info = '财经';
        word = '/zfinance/realtime';
        div = 'div#Finance.list-sect-sub';
    }

    const response = await axios_ins.get(host);
    const $ = cheerio.load(response.data);
    const data = $('li', div).find('div');
    // .attr('about')
    const resultItems = await Promise.all(
        data.toArray().map(async (item) => {
            const $item = $(item);
            const link = baseUrl + $item.attr('about');

            let resultItem = {};

            const value = await ctx.cache.get(link);

            if (value) {
                resultItem = JSON.parse(value);
            } else {
                const article = await axios_ins.get(link);
                const $1 = cheerio.load(article.data);
                const res = $1('.datestamp.date-updated.meta-date-updated', '.body-content')
                    .contents()
                    .filter(function() {
                        return this.nodeType === 3;
                    })
                    .text()
                    .replace('年', '-')
                    .replace('月', '-')
                    .replace('日', '');

                const yyyymmdd = res.replace('更新', '').toString();
                const hhmm = $item
                    .find('em')
                    .text()
                    .replace(/(.{2})/, '$1:');
                let description = '';
                $1('p', '.article-content-container').each(function() {
                    description = description + '<p>' + $(this).html() + '</p>';
                });

                resultItem = {
                    title: $1('h1', '.body-content').text(),
                    description: description,
                    pubDate: new Date(yyyymmdd + hhmm).toUTCString(),
                    link: link,
                };

                ctx.cache.set(link, JSON.stringify(resultItem), 24 * 60 * 60);
            }
            // };
            return Promise.resolve(resultItem);
        })
    );

    ctx.state.data = {
        title: `《联合早报》${info} 即时`,
        link: baseUrl + word,
        description: '《联合早报》被公认是一份素质高、负责任、报道客观、言论公正、可信度高的报纸，对中国的发展采取积极的态度，在华人世界中享有崇高的信誉。',
        item: resultItems,
    };
};
