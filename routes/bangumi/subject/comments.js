const axios = require('../../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (subjectID, minLength) => {
    // bangumi.tv未提供获取“吐槽（comments）”的API，因此仍需要通过抓取网页来获取
    const link = `https://bgm.tv/subject/${subjectID}/comments`;
    const html = (await axios.get(link)).data;
    const $ = cheerio.load(html);
    const title = $('.nameSingle')
        .find('a')
        .text();
    const comments = $('.item')
        .map((i, el) => {
            const $el = $(el);
            const $rateEl = $el.find('.starsinfo');
            let rate = null;
            if ($rateEl.length > 0) {
                rate = $rateEl.attr('class').match(/sstars(\d)/)[1];
            }
            return {
                user: $el.find('.l').text(),
                rate: rate ? rate / 2 : '无',
                content: $el.find('p').text(),
            };
        })
        .get()
        .filter((obj) => obj.content.length >= minLength);
    return {
        title: `${title}的Bangumi吐槽箱`,
        link,
        item: comments.map((c) => ({
            title: `${c.user}的吐槽`,
            description: `【评分：${c.rate}】  ${c.content}`,
            guid: c.user,
            link,
        })),
    };
};
