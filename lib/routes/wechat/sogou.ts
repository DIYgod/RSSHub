import { Route, DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { finishArticleItem } from '@/utils/wechat-mp';
import logger from '@/utils/logger';

const host = 'https://weixin.sogou.com';
const hardcodedCookie = 'SNUID=78725B470A0EF2C3F97AA5EB0BBF95C1; ABTEST=0|1680917938|v1; SUID=8F7B1C682B83A20A000000006430C5B2; PHPSESSID=le2lak0vghad5c98ijd3t51ls4; IPLOC=USUS5';

interface SogouItemInternal extends DataItem {
    _internal: {
        isWeChatLink: boolean;
    };
}

async function fetchAndParsePage(wechatId: string): Promise<SogouItemInternal[]> {
    const searchUrl = `${host}/weixin`;
    let response;
    try {
        const responseHtml = await ofetch(searchUrl, {
            query: {
                ie: 'utf8',
                s_from: 'input',
                _sug_: 'n',
                _sug_type_: '1',
                type: '2',
                query: wechatId,
                page: '1',
            },
            headers: {
                Referer: host,
                Cookie: hardcodedCookie,
            },
        });
        response = { data: responseHtml };
    } catch (error) {
        logger.error(`Failed to fetch Sogou search for ${wechatId}: ${error instanceof Error ? error.message : String(error)}`);
        return [];
    }

    const $ = load(response.data);
    const list = $('ul.news-list > li').toArray();

    const pageItemsPromises = list.map(async (li): Promise<SogouItemInternal | null> => {
        const $li = $(li);
        const title = $li.find('h3 > a').text().trim();
        const sogouLinkHref = $li.find('h3 > a').attr('href');
        if (!sogouLinkHref) {
            logger.warn(`Skipping item with missing link for wechatId: ${wechatId}`);
            return null;
        }
        const sogouLink = host + sogouLinkHref;
        const description = $li.find('p.txt-info').text().trim();

        const timeScript = $li.find('span.s2 script').html();
        const timeMatch = timeScript?.match(/timeConvert\('(\d+)'\)/);
        const pubDate = timeMatch ? parseDate(Number.parseInt(timeMatch[1]) * 1000) : undefined;

        let realLink = sogouLink;
        try {
            const linkResponse = await ofetch.raw(sogouLink, {
                headers: {
                    Referer: searchUrl,
                    Cookie: hardcodedCookie,
                },
                redirect: 'manual',
                ignoreResponseError: true,
            });

            let location = linkResponse.headers?.get('location');

            if (location) {
                if (!location.startsWith('http')) {
                    try {
                        location = new URL(location, sogouLink).toString();
                    } catch (error) {
                        logger.warn(`Invalid redirect location "${location}" for title "${title}" (wechatId: ${wechatId}): ${error instanceof Error ? error.message : String(error)}`);
                        location = null;
                    }
                }

                if (typeof location === 'string' && location) {
                    if (location.startsWith('http://mp.weixin.qq.com') || location.startsWith('https://mp.weixin.qq.com')) {
                        realLink = location;
                    } else {
                        try {
                            const intermediateResponse = await ofetch.raw(location, {
                                headers: {
                                    Referer: sogouLink,
                                    Cookie: hardcodedCookie,
                                },
                                redirect: 'manual',
                                ignoreResponseError: true,
                            });
                            const intermediateLocation = intermediateResponse.headers?.get('location');
                            if (intermediateLocation && (intermediateLocation.startsWith('http://mp.weixin.qq.com') || intermediateLocation.startsWith('https://mp.weixin.qq.com'))) {
                                realLink = intermediateLocation;
                            } else {
                                // logger.warn(`Could not resolve final WeChat link for title "${title}" (wechatId: ${wechatId}) after intermediate redirect`);
                            }
                        } catch (error) {
                            logger.warn(`Failed to resolve intermediate redirect for title "${title}" (wechatId: ${wechatId}): ${error instanceof Error ? error.message : String(error)}`);
                        }
                    }
                }
            } else {
                logger.debug(`No redirect location found for title "${title}" (wechatId: ${wechatId})`);
            }
        } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            if (typeof error === 'object' && error !== null && 'response' in error && typeof error.response === 'object' && error.response !== null && 'status' in error.response) {
                logger.debug(`Redirect request failed for "${title}" (wechatId: ${wechatId}) with status ${error.response.status}: ${errorMsg}`);
            } else {
                logger.debug(`Redirect request failed for "${title}" (wechatId: ${wechatId}): ${errorMsg}`);
            }
        }

        const isWeChatLink = realLink.startsWith('http://mp.weixin.qq.com') || realLink.startsWith('https://mp.weixin.qq.com');
        const author = $li.find('span.all-time-y2').text().trim();

        return {
            title,
            link: realLink,
            description,
            author,
            pubDate,
            guid: realLink,
            _internal: {
                isWeChatLink,
            },
        } as SogouItemInternal;
    });

    return (await Promise.all(pageItemsPromises)).filter((item): item is SogouItemInternal => item !== null);
}

export const route: Route = {
    path: '/sogou/:id',
    categories: ['new-media'],
    example: '/wechat/sogou/qimao0908',
    parameters: { id: '公众号 id, 打开 weixin.sogou.com 并搜索相应公众号， 在 URL 中找到 id' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '公众号（搜狗来源）',
    maintainers: ['EthanWng97', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    const wechatId = ctx.req.param('id');

    const allItems: SogouItemInternal[] = await fetchAndParsePage(wechatId);

    const firstPageFirstItem = allItems[0];
    const accountTitle = firstPageFirstItem?.author || wechatId;

    const finalItemsPromises = allItems.map(async (item: SogouItemInternal): Promise<DataItem | null> => {
        let resultItem: DataItem | SogouItemInternal = item;
        if (item._internal.isWeChatLink) {
            try {
                resultItem = await finishArticleItem(item);
            } catch (error) {
                logger.debug(`finishArticleItem failed for ${item.link}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        if (resultItem && typeof resultItem === 'object') {
            const finalItem: DataItem = {
                title: resultItem.title,
                link: resultItem.link,
                description: resultItem.description,
                author: resultItem.author,
                pubDate: resultItem.pubDate,
                guid: resultItem.guid,
                ...(resultItem.content && { content: resultItem.content }),
            };
            return finalItem;
        }
        logger.debug(`Unexpected null or non-object item during final processing for link: ${item?.link}`);
        return null;
    });

    const finalItems: DataItem[] = (await Promise.all(finalItemsPromises)).filter((item): item is DataItem => item !== null);

    return {
        title: `${accountTitle} 的微信公众号`,
        link: `${host}/weixin?query=${wechatId}`,
        description: `${accountTitle} 的微信公众号`,
        item: finalItems,
    };
}
