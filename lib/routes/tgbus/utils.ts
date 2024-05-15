import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const parseArticle = (item, tryGet) =>
    tryGet(item.link, async () => {
        const { data: response } = await got(item.link);
        const $ = load(response as unknown as string);

        const infoBox = $('div.info-box');
        item.author = infoBox.find('b:nth-child(4)').text().trim();
        item.pubDate = timezone(parseDate(infoBox.find('i:last-child').text()), 8);
        item.description = $('.article-main-contentraw').html();

        return item;
    });

export { parseArticle };
