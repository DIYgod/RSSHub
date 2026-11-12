import InvalidParameterError from '@/errors/types/invalid-parameter';
import NotFoundError from '@/errors/types/not-found';
import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

import { getDrivers, getFileTitle, getOperatingSystems, getProductInfo, parseLanguage, renderFileDescription } from './utils';

export const route: Route = {
    path: '/driver/:model/:lang?/:os?',
    categories: ['program-update'],
    example: '/asus/driver/ROG-Flow-Z13-2025',
    parameters: {
        model: 'Model name or product-page slug, e.g. `PRIME-X570-PRO` or `ROG-Flow-Z13-2025`',
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
        os: 'Operating system ID, e.g. `52` for Windows 11 64-bit or `45` for Windows 10 64-bit. Defaults to the first operating system ASUS lists for the product',
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
            target: '/driver/:model',
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
            target: '/driver/:model',
        },
    ],
    name: 'Driver',
    maintainers: ['regulad'],
    handler,
    url: 'www.asus.com',
    description: 'Lists the drivers and utilities ASUS publishes for the product on one operating system. If an `os` ID is not available for the product, the error message lists the IDs that are.',
};

async function handler(ctx) {
    const model = ctx.req.param('model');
    const language = parseLanguage(ctx.req.param('lang'));
    const osId = ctx.req.param('os');
    const productInfo = await getProductInfo(model, language);

    const operatingSystems = await getOperatingSystems(productInfo, language);
    if (operatingSystems.length === 0) {
        throw new NotFoundError(`ASUS does not list drivers for ${productInfo.title}.`);
    }
    const os = osId ? operatingSystems.find((candidate) => candidate.Id === osId) : operatingSystems[0];
    if (!os) {
        const available = operatingSystems.map((candidate) => `${candidate.Id} (${candidate.Name})`).join(', ');
        throw new InvalidParameterError(`ASUS does not list drivers for ${productInfo.title} on OS ${osId}. Available OS IDs: ${available}.`);
    }

    const groups = await getDrivers(productInfo, language, os.Id);
    const link = new URL('helpdesk_download/', productInfo.url.endsWith('/') ? productInfo.url : `${productInfo.url}/`).href;

    const items = groups.flatMap((group) =>
        group.Files.map((file) => ({
            title: getFileTitle(file, `${productInfo.title} ${group.Name}`),
            description: renderFileDescription(file, language),
            category: [group.Name],
            guid: `${productInfo.url}#${file.Id}`,
            pubDate: parseDate(file.ReleaseDate, 'YYYY/MM/DD'),
            link,
        }))
    );

    return {
        title: `${productInfo.title} ${language === 'zh' ? '驱动程序' : 'Drivers'} (${os.Name})`,
        link,
        image: productInfo.image,
        item: items,
    };
}
