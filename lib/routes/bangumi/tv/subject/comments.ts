// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';

module.exports = async (subjectID, minLength) => {
    // bangumi.tv未提供获取“吐槽（comments）”的API，因此仍需要通过抓取网页来获取
    const link = `https://bgm.tv/subject/${subjectID}/comments`;
    const { data: html } = await got(link);
    const $ = load(html);
    const title = $('.nameSingle').find('a').text();
    const comments = $('.item')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const $rateEl = $el.find('.starlight');
            let rate = null;
            if ($rateEl.length > 0) {
                rate = $rateEl.attr('class').match(/stars(\d)/)[1];
            }

            const dateString = $el.find('small.grey').text().slice(2);

            const date = dateString.includes('ago')
                ? parseRelativeDate(dateString) // 处理表示相对日期的字符串
                : parseDate(dateString); // 表示绝对日期的字符串

            return {
                user: $el.find('.l').text(),
                rate: rate || '无',
                content: $el.find('p').text(),
                date,
            };
        })
        .filter((obj) => obj.content.length >= minLength);

    return {
        title: `${title}的 Bangumi 吐槽箱`,
        link,
        item: comments.map((c) => ({
            title: `${c.user}的吐槽`,
            description: `【评分：${c.rate}】  ${c.content}`,
            guid: `${link}#${c.user}`,
            pubDate: c.date,
            link,
        })),
    };
};
