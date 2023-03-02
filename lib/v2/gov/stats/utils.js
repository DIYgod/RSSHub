const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { art } = require('@/utils/render');
const path = require('path');

const parseContList = async (url, selector, ctx) => {
    const response = await got(url);
    const $ = cheerio.load(response.data);
    const list = $(selector)
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 12)
        .toArray()
        .map((item) => {
            item = $(item);

            const date = item.find('.cont_tit02').text() || item.next('.cont_tit02').text();
            return {
                title: item.find('.cont_tit03, .cont_tit01').text(),
                link: new URL(item.attr('href'), url).href,
                pubDate: parseDate(date, 'YYYY-MM-DD'),
            };
        })
        .filter((item) => item.title); // exclude the empty title
    const title = $('#PL_DAOHANG')
        .text()
        .replace(/(.+)首页/, '国家统计局');
    return { list, title };
};

const parseXilan = (item, ctx) =>
    ctx.cache.tryGet(item.link, async () => {
        const response = await got(item.link);
        const $ = cheerio.load(response.data);
        const title = $('.xilan_titf').text();
        item.author = title.match(/来源：(.*)发布时间/)?.[1].trim() ?? '国家统计局';
        item.pubDate = timezone(parseDate(title.match(/发布时间：(.*)/)?.[1].trim() ?? item.pubDate), +8);

        // Change the img src from relative to absolute for a better compatibility
        $('.xilan_con')
            .find('img')
            .each((_, el) => {
                $(el).attr('src', new URL($(el).attr('src'), item.link).href);
                // oldsrc is causing freshrss imageproxy not to work correctly
                $(el).removeAttr('oldsrc').removeAttr('alt');
            });
        item.description = $('.xilan_con').html();

        const attachmentTitle = $('.wenzhang_tit').filter(function () {
            return $(this).text().trim() === '相关附件';
        });
        if (attachmentTitle.length > 0) {
            const attachments = attachmentTitle
                .first()
                .next('.wenzhang_list')
                .find('a')
                .toArray()
                .map((attachment) => {
                    attachment = $(attachment);
                    return {
                        href: new URL(attachment.attr('href'), item.link).href,
                        text: attachment.text().trim(),
                    };
                });
            item.description += art(path.join(__dirname, 'templates/attachments.art'), {
                attachments,
            });
        }
        return item;
    });

module.exports = {
    parseXilan,
    parseContList,
};
