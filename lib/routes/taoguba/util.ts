import { createHash } from 'node:crypto';

import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.tgb.cn';

const getPage = async (url: string, redirectsRemaining = 3): Promise<{ data: string; url: string }> => {
    const parsedUrl = new URL(url);
    if (parsedUrl.origin !== rootUrl || parsedUrl.username || parsedUrl.password) {
        throw new Error('Taoguba requests must use https://www.tgb.cn.');
    }

    const cookie = config.taoguba.cookie?.trim();
    const response = await ofetch.raw<string, 'text'>(url, {
        headers: cookie ? { Cookie: cookie } : undefined,
        responseType: 'text',
        redirect: 'manual',
    });
    if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location || redirectsRemaining === 0) {
            throw new Error('Taoguba returned an invalid or repeated redirect.');
        }
        return getPage(new URL(location, url).href, redirectsRemaining - 1);
    }

    return { data: response._data!, url: response.url };
};

const renderPostDetail = async <T extends DataItem>(item: T) => {
    const cookie = config.taoguba.cookie?.trim();
    const sessionKey = cookie ? createHash('sha256').update(cookie).digest('hex') : 'anonymous';
    const details = await cache.tryGet(`${item.link}:details:v3:${sessionKey}`, async (): Promise<Pick<DataItem, 'description' | 'pubDate' | 'category'>> => {
        const detailResponse = await getPage(item.link!);

        const content = load(detailResponse.data);

        content('#videoImg').remove();
        content('img').each((_, img) => {
            if (!img.attribs.src2) {
                return;
            }

            img.attribs.src = img.attribs.src2;
            delete img.attribs.src2;
            delete img.attribs['data-original'];
        });

        let description = content('#first').html();
        if (detailResponse.url?.startsWith('https://www.tgb.cn/topic/transfer') || content('.login-view-button').length !== 0) {
            description += '<br>登录后可查看完整文章';
        }

        const pubDate = timezone(
            parseDate(
                content('.article-data > span:nth-child(2)')
                    .text()
                    .match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)![0]
            ),
            8
        );

        const category = content('.classify')
            .toArray()
            .map((item) => content(item).text().trim());

        return { description, pubDate, category };
    });
    return { ...item, ...details };
};

export { getPage, renderPostDetail, rootUrl };
