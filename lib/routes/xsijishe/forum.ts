// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const baseUrl = 'https://xsijishe.com';

export default async (ctx) => {
    const fid = ctx.req.param('fid');
    const url = `${baseUrl}/forum-${fid}-1.html`;
    const resp = await got(url);
    const $ = load(resp.data);
    const forumCategory = $('.nex_bkinterls_top .nex_bkinterls_ls a').text();
    let items = $('[id^="normalthread"]')
        .toArray()
        .map((item) => {
            item = $(item);
            const nexAuthorBtms = item.find('.nex_author_btms');
            const nexForumtitTopA = item.find('.nex_forumtit_top a').first();
            const nexFtdate = nexAuthorBtms.find('.nex_ftdate');
            const pubDate = nexFtdate.find('span').length > 0 ? nexFtdate.find('span').attr('title') : nexFtdate.text().replace('发表于', '');
            return {
                title: nexForumtitTopA.text().trim(),
                pubDate: parseDate(pubDate.trim()),
                category: nexAuthorBtms.find('em a').text().trim(),
                link: baseUrl + '/' + nexForumtitTopA.attr('href'),
                author: item.find('.nex_threads_author').find('a').text().trim(),
            };
        });
    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const resp = await got(item.link);
                const $ = load(resp.data);
                const firstViewBox = $('.t_f').first();

                firstViewBox.find('img').each((_, img) => {
                    img = $(img);
                    if (img.attr('zoomfile')) {
                        img.attr('src', img.attr('zoomfile'));
                        img.removeAttr('zoomfile');
                        img.removeAttr('file');
                    }
                    img.removeAttr('onmouseover');
                });

                item.description = firstViewBox.html();
                return item;
            })
        )
    );
    ctx.set('data', {
        title: `司机社${forumCategory}论坛`,
        link: url,
        description: `司机社${forumCategory}论坛`,
        item: items,
    });
};
