const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const brand = ctx.params.brand;
    const model = ctx.params.model;
    const url = `https://openwrt.org/toh/${brand}/${model}`;
    const response = await got(url);
    const $ = cheerio.load(response.data);
    const table = $('#installation').next();

    ctx.state.data = {
        title: $('h1').text() + ' - OpenWrt Releases',
        link: url,
        description: $('.dw-content div.level1').text(),
        language: 'en-US',
        item: [
            {
                title: table.find('.supported_current_rel').text(),
                link: url,
                description: `Firmware OpenWrt Install: ${table.find('.firmware_openwrt_install_url').html()}<br><br>Firmware OpenWrt Upgrade: ${$('.firmware_openwrt_upgrade_url').html()}'`,
            },
        ],
    };
};
