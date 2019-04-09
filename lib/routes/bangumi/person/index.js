const axios = require('../../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    // bangumi.tv未提供获取“人物信息”的API，因此仍需要通过抓取网页来获取
    const personID = ctx.params.id;
    const link = `https://bgm.tv/person/${personID}/works?sort=date`;
    const html = (await axios.get(link)).data;
    const $ = cheerio.load(html);
    const personName = $('.nameSingle a').text();
    const works = $('.item')
        .map((i, el) => {
            const $el = $(el);
            const $workEl = $el.find('.l');
            return {
                work: $workEl.text(),
                workURL: `https://bgm.tv${$workEl.attr('href')}`,
                workInfo: $el.find('p.info').text(),
                job: $el.find('.badge_job').text(),
            };
        })
        .get();

    ctx.state.data = {
        title: `${personName}参与的作品`,
        link,
        item: works.map((c) => ({
            title: `${personName}以${c.job}的身份参与了作品《${c.work}》`,
            description: c.workInfo,
            link: c.workURL,
            pubDate: c.workInfo.substring(0, c.workInfo.indexOf(' /')) === '' ? new Date(0).toUTCString() : new Date(c.workInfo.substring(0, c.workInfo.indexOf(' /'))).toUTCString(),
        })),
    };
};
