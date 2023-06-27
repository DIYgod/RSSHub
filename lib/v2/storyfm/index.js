const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://storyfm.cn';
    const response = await got(url);
    const $ = cheerio.load(response.data);
    const cnMonth = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
    const items = $('.isotope > .isotope-item')
        .map((_, ele) => {
            const $item = cheerio.load(ele);
            const img = $item('.isotope-img-container img').attr('src');
            const infoNode = $item('.isotope-index-text').first();
            const title = infoNode.find('.soundbyte-podcast-progression-title');
            const link = infoNode.find('a.soundbyte-podcast-play-progression').attr('href');
            const time = infoNode.find('.fa-clock-o').text();
            const date = infoNode.find('.soundbyte-podcast-date-progression').text();
            const [month, day, year] = date
                .replace(',', '')
                .split(' ')
                .map((value) => {
                    if (value.includes('月')) {
                        const enMongth = cnMonth.findIndex((cnMonthStr) => value.includes(cnMonthStr));
                        value = enMongth + 1;
                    }
                    return value;
                });

            const pubDate = new Date(`${year}-${month}-${day} ${time}`).toUTCString();
            return {
                title,
                description: [`<img src="${img}"/>`, title].join('<br/>'),
                link,
                pubDate,
            };
        })
        .get();
    ctx.state.data = {
        title: '故事说FM',
        description: '故事说FM',
        link: url,
        item: items,
    };
};
