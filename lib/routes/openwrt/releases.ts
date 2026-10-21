import { html } from 'hono/html';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

type HardwareCatalog = {
    columns: string[];
    entries: Array<Array<string | string[] | null>>;
};

function getDevice(catalog: HardwareCatalog, devicePage: string) {
    if (!catalog || typeof catalog !== 'object' || !Array.isArray(catalog.columns) || !Array.isArray(catalog.entries) || !catalog.entries.length) {
        throw new Error('OpenWrt did not provide its hardware catalog. Check whether the official ToH JSON endpoint is accessible.');
    }
    const devicePageIndex = catalog.columns.indexOf('devicepage');
    const entries = catalog.entries.filter((entry) => entry[devicePageIndex] === devicePage);
    const values = (column: string) => {
        const index = catalog.columns.indexOf(column);
        return [...new Set(entries.flatMap((entry) => entry[index] ?? []))];
    };
    const brand = values('brand').join(', ');
    const model = values('model').join(', ');
    const version = values('supportedcurrentrel').join(', ');
    const installLinks = values('firmwareopenwrtinstallurl');
    const upgradeLinks = values('firmwareopenwrtupgradeurl');
    if (!brand || !model || !version || (!installLinks.length && !upgradeLinks.length)) {
        throw new Error(`OpenWrt did not provide a release and firmware links for ${devicePage}. Check the device path against the official hardware catalog.`);
    }
    return { name: `${brand} ${model}`, version, installLinks, upgradeLinks };
}

function renderFirmwareLinks(links: string[]) {
    return html`${links.map((link) => html`<a href="${link}">${link}</a><br />`)}`.toString();
}

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
            source: ['openwrt.org/toh/:brand/:model'],
            target: '/releases/:brand/:model',
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
    const devicePage = `toh:${brand}:${model}`;
    const catalog = await cache.tryGet('openwrt:hardware-catalog:v1', async () => {
        const data = await ofetch<HardwareCatalog>('https://openwrt.org/toh.json');
        getDevice(data, devicePage);
        return data;
    });
    const device = getDevice(catalog, devicePage);

    return {
        title: `${device.name} - OpenWrt Releases`,
        link: url,
        language: 'en-us' as const,
        item: [
            {
                title: device.version,
                link: url,
                description: `Firmware OpenWrt Install: ${renderFirmwareLinks(device.installLinks)}<br><br>Firmware OpenWrt Upgrade: ${renderFirmwareLinks(device.upgradeLinks)}`,
            },
        ],
    };
}
