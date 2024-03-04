// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const parseArticle = (item, tryGet) =>
    tryGet(item.link, async () => {
        const { data: response } = await got(item.link);
        const $ = load(response);

        if (item.link.startsWith('https://dl.3dmgame.com/')) {
            const lis = $('.patchtop .lis');
            const [, category, pubDate, author] = lis.text().match(/补丁类型：(.*?)\n.*整理时间：(.*?)\n.*补丁制作：(.*?)\n/s);

            item.description = lis.html() + $('.L_title').html() + $('.GmL_1').html();
            item.category = category;
            item.pubDate = timezone(parseDate(pubDate), 8);
            item.author = author;
        } else {
            item.description = $('.news_warp_center').html();
            item.pubDate = timezone(parseDate($('.time span').text()), 8);
            item.author = $('.intem li:nth-child(2) .name').text().trim();
        }

        return item;
    });

module.exports = {
    parseArticle,
};
