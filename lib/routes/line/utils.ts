import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import logger from '@/utils/logger';
import cache from '@/utils/cache';
const baseUrl = 'https://today.line.me';

const parseList = (items) =>
    items.map((item) => ({
        title: item.title,
        link: item.url.url,
        pubDate: parseDate(item.publishTimeUnix),
        hash: item.url.hash,
        category: item.categoryName,
    }));

const parseItems = (list) =>
    Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const edition = item.link.match(/today\.line\.me\/(\w+?)\/v2\/.*$/)[1];
                let data;
                try {
                    const response = await got(`${baseUrl}/webapi/portal/page/setting/article`, {
                        searchParams: {
                            country: edition,
                            hash: item.hash,
                            group: 'NA',
                        },
                    });
                    data = response.data;
                } catch (error) {
                    if ((error.name === 'HTTPError' || error.name === 'FetchError') && error.response.statusCode === 404) {
                        logger.error(`Error parsing article ${item.link}: ${error.message}`);
                        return item;
                    }
                    throw error;
                }

                const $ = load(data.data.content, null, false);

                $('img').each((_, img) => {
                    delete img.attribs['data-hashid'];
                    img.attribs.src = img.attribs.src.replace(/\/w\d+$/, '');
                });

                item.description = $.html();
                item.author = data.data.author;
                item.category = [...new Set([item.category, ...data.data.exploreLinks.map((link) => link.name)])];

                return item;
            })
        )
    );

export { baseUrl, parseList, parseItems };
