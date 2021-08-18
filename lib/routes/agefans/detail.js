const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://www.agefans.cc/detail/${ctx.params.id}`,
    });
    const $ = cheerio.load(response.data);

    const defaultIdx = parseInt($('#DEF_PLAYINDEX').get(0).children[0].data);
    const items = $('#main0 div')
        .filter((idx) => defaultIdx === idx)
        .find('a')
        .map((idx, item) => ({
            title: $(item).text(),
            description: $(item).text(),
            link: `https://www.agefans.cc${$(item).attr('href')}`,
        }))
        .get();
    items.reverse();

    ctx.state.data = {
        title: `AGE动漫 - ${$('.detail_imform_name').text()}`,
        link: `https://www.agefans.cc/detail/${ctx.params.id}`,
        description: $('.detail_imform_desc_pre').text(),
        item: items,
    };
};
