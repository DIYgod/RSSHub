import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.tgb.cn';

const renderPostDetail = async <T extends DataItem>(item: T) => {
    const details = await cache.tryGet(`${item.link}:details:v2`, async (): Promise<Pick<DataItem, 'description' | 'pubDate' | 'category'>> => {
        const detailResponse = await got({
            method: 'get',
            url: item.link,
        });

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

export { renderPostDetail, rootUrl };
