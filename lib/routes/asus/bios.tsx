import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

import { getBIOS, getFileTitle, getProductInfo, parseLanguage, renderFileDescription } from './utils';

export const route: Route = {
    path: '/bios/:model/:lang?',
    categories: ['program-update'],
    example: '/asus/bios/RT-AX88U/zh',
    parameters: {
        model: 'Model, can be found in product page',
        lang: {
            description: 'Language, provide access routes for other parts of the world',
            options: [
                {
                    label: 'Chinese',
                    value: 'zh',
                },
                {
                    label: 'Global',
                    value: 'en',
                },
            ],
            default: 'en',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: [
                'www.asus.com/displays-desktops/:productLine/:series/:model',
                'www.asus.com/laptops/:productLine/:series/:model',
                'www.asus.com/motherboards-components/:productLine/:series/:model',
                'www.asus.com/networking-iot-servers/:productLine/:series/:model',
                'www.asus.com/:region/displays-desktops/:productLine/:series/:model',
                'www.asus.com/:region/laptops/:productLine/:series/:model',
                'www.asus.com/:region/motherboards-components/:productLine/:series/:model',
                'www.asus.com/:region/networking-iot-servers/:productLine/:series/:model',
            ],
            target: '/bios/:model',
        },
        {
            source: [
                'rog.asus.com/laptops/:series/:model/*',
                'rog.asus.com/motherboards/:series/:model/*',
                'rog.asus.com/gaming-handhelds/:series/:model/*',
                'rog.asus.com/desktops/:series/:model/*',
                'rog.asus.com/:region/laptops/:series/:model/*',
                'rog.asus.com/:region/motherboards/:series/:model/*',
                'rog.asus.com/:region/gaming-handhelds/:series/:model/*',
                'rog.asus.com/:region/desktops/:series/:model/*',
            ],
            target: '/bios/:model',
        },
    ],
    name: 'BIOS',
    maintainers: ['Fatpandac'],
    handler,
    url: 'www.asus.com',
    description: 'Lists every BIOS and firmware download ASUS publishes for the product, such as BIOS installers, EZ Flash images and ROG keyboard or USB-PD firmware tools.',
};

async function handler(ctx) {
    const model = ctx.req.param('model');
    const language = parseLanguage(ctx.req.param('lang'));
    const productInfo = await getProductInfo(model, language);
    const groups = await getBIOS(productInfo, language);

    const items = groups.flatMap((group, groupIndex) =>
        group.Files.map((file) => ({
            title: getFileTitle(file, `${productInfo.title} ${group.Name}`),
            description: renderFileDescription(file, language),
            category: [group.Name],
            // The first group used to be the only one in the feed, so keep its GUIDs to avoid resending old entries to existing subscribers.
            guid: groupIndex === 0 ? productInfo.url + file.Version : `${productInfo.url}#${file.Id}`,
            pubDate: parseDate(file.ReleaseDate, 'YYYY/MM/DD'),
            link: productInfo.url,
        }))
    );

    return {
        title: `${productInfo.title} BIOS`,
        link: productInfo.url,
        image: productInfo.image,
        item: items,
    };
}
