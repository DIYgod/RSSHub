const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (subjectID, minLength) => {
    // bangumi.tv未提供获取“吐槽（comments）”的API，因此仍需要通过抓取网页来获取
    const link = `https://bgm.tv/subject/${subjectID}/comments`;
    const html = (await got.get(link)).data;
    const $ = cheerio.load(html);
    const title = $('.nameSingle').find('a').text();
    const comments = $('.item')
        .map((i, el) => {
            const $el = $(el);
            const $rateEl = $el.find('.starsinfo');
            let rate = null;
            if ($rateEl.length > 0) {
                rate = $rateEl.attr('class').match(/sstars(\d)/)[1];
            }

            const dateString = $el.find('small.grey').text().slice(2);
            let date;
            if (dateString.includes('ago')) {
                // 处理表示相对日期的字符串
                const list = dateString
                    .match(/(\dd )?(\d{1,2}h )?(\d{1,2}m )?ago/)
                    .slice(1)
                    .map((s) => (s ? Number(s.slice(0, -2)) : 0));

                date = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * list[0] - 1000 * 60 * 60 * list[1] - 1000 * 60 * list[2]).toUTCString();
            } else {
                // 表示绝对日期的字符串
                date = new Date(dateString).toUTCString();
            }

            return {
                user: $el.find('.l').text(),
                rate: rate || '无',
                content: $el.find('p').text(),
                date,
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
