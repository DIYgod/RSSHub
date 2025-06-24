import ofetch from '@/utils/ofetch';
import { CheerioAPI } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

const defaultSrc = '_static/ee6af7e.js';
const defaultToken = 'djflkdsoisknfoklsyhownfrlewfknoiaewf';

const rootUrl = 'https://top.aibase.com';
const apiRootUrl = 'https://app.chinaz.com';

/**
 * Converts a string to an array.
 * If the string starts with '[', it is assumed to be a JSON array and is parsed accordingly.
 * Otherwise, the string is wrapped in an array.
 *
 * @param str - The input string to convert to an array.
 * @returns An array created from the input string.
 */
const strToArray = (str: string) => {
    if (str.startsWith('[')) {
        return JSON.parse(str);
    }
    return [str];
};

art.defaults.imports.strToArray = strToArray;

/**
 * Retrieve a token asynchronously using a CheerioAPI instance.
 * @param $ - The CheerioAPI instance.
 * @returns A Promise that resolves to a string representing the token.
 */
const getToken = async ($: CheerioAPI): Promise<string> => {
    const scriptUrl = new URL($('script[src]').last()?.prop('src') ?? defaultSrc, rootUrl).href;

    const script = await ofetch(scriptUrl, {
        responseType: 'text',
    });

    return script.match(/"\/(\w+)\/ai\/.*?\.aspx"/)?.[1] ?? defaultToken;
};

/**
 * Build API URLs asynchronously using a CheerioAPI instance.
 * @param $ - The CheerioAPI instance.
 * @returns An object containing API URLs.
 */
const buildApiUrl = async ($: CheerioAPI) => {
    const token = await getToken($);

    const apiRecommListUrl = new URL(`${token}/ai/GetAIProcRecommList.aspx`, apiRootUrl).href;
    const apiRecommProcUrl = new URL(`${token}/ai/GetAIProcListByRecomm.aspx`, apiRootUrl).href;
    const apiTagProcUrl = new URL(`${token}/ai/GetAiProductOfTag.aspx`, apiRootUrl).href;
    // AI 资讯列表
    const apiInfoListUrl = new URL(`${token}/ai/GetAiInfoList.aspx`, apiRootUrl).href;
    // AI 日报
    const aILogListUrl = new URL(`${token}/ai/v2/GetAILogList.aspx`, apiRootUrl).href;

    return {
        apiRecommListUrl,
        apiRecommProcUrl,
        apiTagProcUrl,
        apiInfoListUrl,
        aILogListUrl,
    };
};

/**
 * Process an array of items to generate a new array of processed items for RSS.
 * @param items - An array of items to process.
 * @returns An array of processed items.
 */
const processItems = (items: any[]): any[] =>
    items.map((item) => {
        const title = item.name;
        const image = item.imgurl;
        const description = art(path.join(__dirname, 'templates/description.art'), {
            images: image
                ? [
                      {
                          src: image,
                          alt: title,
                      },
                  ]
                : undefined,
            item,
        });
        const guid = `aibase-${item.zurl}`;

        return {
            title,
            description,
            pubDate: timezone(parseDate(item.addtime), +8),
            link: new URL(`tool/${item.zurl}`, rootUrl).href,
            category: [...new Set([...strToArray(item.categories), ...strToArray(item.tags), item.catname, item.procattrname, item.procformname, item.proctypename])].filter(Boolean),
            guid,
            id: guid,
            content: {
                html: description,
                text: item.desc,
            },
            image,
            banner: image,
            updated: parseDate(item.UpdTime),
            enclosure_url: item.logo,
            enclosure_type: item.logo ? `image/${item.logo.split(/\./).pop()}` : undefined,
            enclosure_title: title,
        };
    });

export { rootUrl, processItems, buildApiUrl };
