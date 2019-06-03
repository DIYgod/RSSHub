const axios = require('@/utils/axios');
const cheerio = require('cheerio');
const DateTime = require('luxon').DateTime;

module.exports = async (subjectID, minLength) => {
    // bangumi.tv未提供获取“吐槽（comments）”的API，因此仍需要通过抓取网页来获取
    const link = `https://bgm.tv/subject/${subjectID}/comments`;
    const html = (await axios.get(link)).data;
    const $ = cheerio.load(html);
    const title = $('.nameSingle')
        .find('a')
        .text();
    const comments = $('.item')
        .map((i, el) => {
            const $el = $(el);
            const $rateEl = $el.find('.starsinfo');
            let rate = null;
            if ($rateEl.length > 0) {
                rate = $rateEl.attr('class').match(/sstars(\d)/)[1];
            }

            const dateString = $el
                .find('small.grey')
                .text()
                .slice(2);
            let date;
            if (dateString.includes('ago')) {
                // 处理表示相对日期的字符串
                const list = dateString
                    .match(/(\dd )?(\d{1,2}h )?(\d{1,2}m )?ago/)
                    .slice(1)
                    .map((s) => (s ? Number(s.slice(0, -2)) : 0));

                date = DateTime.local().minus({
                    days: list[0],
                    hours: list[1],
                    minutes: list[2],
                });
            } else {
                // 表示绝对日期的字符串
                date = DateTime.fromFormat(dateString, 'yyyy-L-dd HH:mm');
            }

            return {
                user: $el.find('.l').text(),
                rate: rate || '无',
                content: $el.find('p').text(),
                date: date.toRFC2822(),
            };
        })
        .get()
        .filter((obj) => obj.content.length >= minLength);
    return {
        title: `${title}的Bangumi吐槽箱`,
        link,
        item: comments.map((c) => ({
            title: `${c.user}的吐槽`,
            description: `【评分：${c.rate}】  ${c.content}`,
            guid: c.user,
            pubDate: c.date,
            link,
        })),
    };
};
