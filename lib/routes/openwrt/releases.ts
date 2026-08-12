import { load } from 'cheerio';

import type { Language, Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/releases/:brand/:model',
    categories: ['program-update'],
    example: '/openwrt/releases/xiaomi/xiaomi_redmi_router_ac2100',
    parameters: {
        brand: 'Device Model, can be found in url of `Table of Hardware` -> `Device Page`',
        model: 'Same as above',
    },
    radar: [
        {
            source: ['openwrt.org/toh/:band/:model'],
            target: '/releases/:model',
        },
    ],
    name: 'Releases',
    maintainers: ['DIYgod'],
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
        language: 'en-us' as Language,
        item: [
            {
                title: table.find('.supported_current_rel').text(),
                link: url,
                description: `Firmware OpenWrt Install: ${table.find('.firmware_openwrt_install_url').html()}<br><br>Firmware OpenWrt Upgrade: ${$('.firmware_openwrt_upgrade_url').html()}'`,
            },
        ],
    };
}
