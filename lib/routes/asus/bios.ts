import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import cache from '@/utils/cache';

const endPoints = {
    zh: {
        url: 'https://odinapi.asus.com.cn/',
        lang: 'cn',
        websiteCode: 'cn',
    },
    en: {
        url: 'https://odinapi.asus.com/',
        lang: 'en',
        websiteCode: 'global',
    },
};

const getProductInfo = (model, language) => {
    const currentEndpoint = endPoints[language] ?? endPoints.zh;
    const { url, lang, websiteCode } = currentEndpoint;

    const searchAPI = `${url}recent-data/apiv2/SearchSuggestion?SystemCode=asus&WebsiteCode=${websiteCode}&SearchKey=${model}&SearchType=ProductsAll&RowLimit=4&sitelang=${lang}`;

    return cache.tryGet(`asus:bios:${model}:${language}`, async () => {
        const response = await ofetch(searchAPI);
        const product = response.Result[0].Content[0];

        return {
            productID: product.DataId,
            hashId: product.HashId,
            url: product.Url,
            title: product.Title,
            image: product.ImageURL,
            m1Id: product.M1Id,
            productLine: product.ProductLine,
        };
    }) as Promise<{
        productID: string;
        hashId: string;
        url: string;
        title: string;
        image: string;
        m1Id: string;
        productLine: string;
    }>;
};

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
    ],
    name: 'BIOS',
    maintainers: ['Fatpandac'],
    handler,
    url: 'www.asus.com',
};

async function handler(ctx) {
    const model = ctx.req.param('model');
    const language = ctx.req.param('lang') ?? 'en';
    const productInfo = await getProductInfo(model, language);
    const biosAPI =
        language === 'zh' ? `https://www.asus.com.cn/support/api/product.asmx/GetPDBIOS?website=cn&model=${model}&sitelang=cn` : `https://www.asus.com/support/api/product.asmx/GetPDBIOS?website=global&model=${model}&sitelang=en`;

    const response = await ofetch(biosAPI);
    const biosList = response.Result.Obj[0].Files;

    const items = biosList.map((item) => ({
        title: item.Title,
        description: art(path.join(__dirname, 'templates/bios.art'), {
            item,
            language,
        }),
        guid: productInfo.url + item.Version,
        pubDate: parseDate(item.ReleaseDate, 'YYYY/MM/DD'),
        link: productInfo.url,
    }));

    return {
        title: `${productInfo.title} BIOS`,
        link: productInfo.url,
        image: productInfo.image,
        item: items,
    };
}
