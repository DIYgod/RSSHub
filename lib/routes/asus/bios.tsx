import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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
        description: renderToString(
            language === 'zh' ? (
                <>
                    <p>更新信息：</p>
                    {raw(item.Description)}
                    <p>版本: {item.Version}</p>
                    <p>大小: {item.FileSize}</p>
                    <p>
                        下载链接: <a href={item.DownloadUrl.China}>中国下载</a> | <a href={item.DownloadUrl.Global}>全球下载</a>
                    </p>
                </>
            ) : (
                <>
                    <p>
                        <b>Changes:</b>
                    </p>
                    {raw(item.Description)}
                    <p>
                        <b>Version:</b> {item.Version}
                    </p>
                    <p>
                        <b>Size:</b> {item.FileSize}
                    </p>
                    <p>
                        <b>Download:</b> <a href={item.DownloadUrl.Global}>{item.DownloadUrl.Global.split('/').pop().split('?')[0]}</a>
                    </p>
                </>
            )
        ),
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
