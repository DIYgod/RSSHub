import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/releases/:brand/:model',
    radar: [
        {
            source: ['openwrt.org/toh/:band/:model'],
            target: '/releases/:model',
        },
    ],
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const brand = ctx.req.param('brand');
    const model = ctx.req.param('model');
    const url = `https://openwrt.org/toh/${brand}/${model}`;
    const response = await got(url);
    const $ = load(response.data);
    const table = $('#installation').next();

    return {
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
}
