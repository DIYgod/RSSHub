const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');
const { getHtml } = require('./utils');

module.exports = async (ctx) => {
    const host = 'https://www.springer.com';
    const journal = ctx.params.journal;
    const jrnlUrl = host.concat('/journal/', journal);

    // -------------------- 获取issue链接 --------------------
    const html = await getHtml(jrnlUrl);
    const $ = cheerio.load(html);
    const jrnlName = $('h1#journalTitle').text().trim();
    const issueUrl = $('p.c-card__title.u-mb-16.u-flex-grow').find('a').attr('href');

    // -------------------- 有了issue的链接了，开始获取issue中条目各自的链接 --------------------
    const html2 = await getHtml(issueUrl);
    const $2 = cheerio.load(html2);
    const issue = $2('.app-volumes-and-issues__info').find('h1').text();
    const list = $2('article.c-card')
        .map((_, item) => {
            const title = $2(item).find('.c-card__title').text().trim();
            const link = $2(item).find('a').attr('href');
            const doi = link.replace('https://link.springer.com/article/', '');
            const img = $(item).find('img').attr('src');
            return {
                title,
                link,
                doi,
                issue,
                img,
            };
        })
        .get();

    const renderDesc = (item) =>
        art(path.join(__dirname, 'templates/description.art'), {
            item,
        });
    await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const html3 = await getHtml(item.link);
                const $3 = cheerio.load(html3);
                $3('.u-js-hide').remove();
                item.authors = $3('.c-article-author-list').text().trim();
                item.abstract = $3('div#Abs1-content').text();
                item.description = renderDesc(item);
                return item;
            })
        )
    );
    ctx.state.data = {
        title: jrnlName.concat(' - Latest'),
        link: jrnlUrl,
        item: list,
    };
};
