import type { CheerioAPI } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
        const description = renderDescription({
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

export { buildApiUrl, processItems, rootUrl };

const renderDescription = ({ images, item }: { images?: Array<{ src?: string; alt?: string }>; item?: any }): string =>
    renderToString(
        <>
            {images?.map((image, index) =>
                image?.src ? (
                    <figure key={`${image.src}-${index}`}>
                        <img src={image.src} alt={image.alt} />
                    </figure>
                ) : null
            )}
            {item ? (
                <table>
                    <tbody>
                        <tr>
                            <th>名称</th>
                            <td>{item.name}</td>
                        </tr>
                        <tr>
                            <th>标签</th>
                            <td>
                                {strToArray(item.tags).map((tag) => (
                                    <>
                                        <a href={`/topic/${tag}`}>{tag}</a>&nbsp;
                                    </>
                                ))}
                            </td>
                        </tr>
                        <tr>
                            <th>类型</th>
                            <td>{item.proctypename || '无'}</td>
                        </tr>
                        <tr>
                            <th>描述</th>
                            <td>{item.desc || '无'}</td>
                        </tr>
                        <tr>
                            <th>需求人群</th>
                            <td>{renderListText(item.use)}</td>
                        </tr>
                        <tr>
                            <th>使用场景示例</th>
                            <td>{renderListText(item.example)}</td>
                        </tr>
                        <tr>
                            <th>产品特色</th>
                            <td>{renderListText(item.functions)}</td>
                        </tr>
                        <tr>
                            <th>站点</th>
                            <td>{item.url ? <a href={item.url}>{item.url}</a> : '无'}</td>
                        </tr>
                    </tbody>
                </table>
            ) : null}
        </>
    );

const renderListText = (value: string | undefined) => {
    if (!value) {
        return '无';
    }

    const list = strToArray(value);
    if (list.length === 1) {
        return list[0];
    }

    return list.map((entry, index) => <li key={`${entry}-${index}`}>{entry}</li>);
};
