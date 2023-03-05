const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const cheerio = require('cheerio');
const host = 'https://www.amazon.com';
module.exports = async (ctx) => {
    const url = host + '/gp/help/customer/display.html';
    const nodeIdValue = 'GKMQC26VQQMM8XSW';
    const response = await got({
        method: 'get',
        url,
        searchParams: {
            nodeId: nodeIdValue,
        },
    });
    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.a-row.cs-help-landing-section.help-display-cond')
        .map(function () {
            const data = {};
            data.title = $(this).find('.sectiontitle').text();
            data.link = $(this).find('a').eq(0).attr('href');
            data.version = $(this).find('li').first().text();
            data.website = `${url}?nodeId=${nodeIdValue}`;
            data.description = $(this)
                .find('.a-column.a-span8')
                .html()
                .replace(/[\n\t]/g, '');
            return data;
        })
        .get();
    ctx.state.data = {
        title: 'Kindle E-Reader Software Updates',
        link: `${url}?nodeId=${nodeIdValue}`,
        description: 'Kindle E-Reader Software Updates',
        item: list.map((item) => ({
            title: item.title + ' - ' + item.version,
            description:
                item.description +
                art(path.join(__dirname, 'templates/software-description.art'), {
                    item,
                }),
            link: item.link,
        })),
    };
};
