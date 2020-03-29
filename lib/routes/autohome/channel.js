const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.cid;

    const response = await axios({
        method: 'get',
        url: `https://chejiahao.autohome.com.cn/Authors/${id}?infotype=3`,
        headers: {
            Host: 'chejiahao.autohome.com.cn',
            Referer: `https://chejiahao.autohome.com.cn/Authors/${id}`,
        },
        responseType: 'document',
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const description = $('div.author-header div.messR div.intro')
        .text()
        .split('\n')[0];
    const list = $('div.author-content').find('div.video.identclass');

    ctx.state.data = {
        title: $('div.author-header div.messR div.name.text-overflow')
            .text()
            .trim(),
        link: `https://chejiahao.autohome.com.cn/Authors/${id}?infotype=3`,
        description: description,
        item: list &&
            list
            .map((index, item) => ({
                title: `${$(item)
                        .find('span.userTitle')
                        .text()}`,
                pubDate: new Date(
                    new Date().getFullYear() +
                    '-' +
                    $(item)
                    .find('span.time')
                    .text()
                ).toUTCString(),
                view: `${$(item)
                        .find('span.liulan')
                        .text()}`,
                link: 'https://chejiahao.autohome.com.cn' +
                    $(item)
                    .find('a')
                    .attr('href')
                    .split('#')[0],
            }))
            .get()
            .reverse(),
    };
};
