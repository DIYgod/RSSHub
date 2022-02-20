const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const community = ctx.params.community;
    const category = ctx.params.category || '';

    let url = `https://learnku.com/${community}`;
    if (category !== '') {
        url = `https://learnku.com/${community}/c/${category}`;
    }

    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.simple-topic').get();
    const item = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const categoryName = $('.category-name span').text().trim();
            if (['置顶', '广告'].includes(categoryName)) {
                return '';
            }
            $('.topic-title i').remove();
            const itemLink = $('.topic-title-wrap').attr('href');

            const title = $('.topic-title').text().trim();
            const content = await ctx.cache.tryGet(itemLink, async () => {
                const result = await got.get(itemLink);

                return cheerio.load(result.data);
            });
            const article = content('.article-content .content-body').html();
            const comment = content('#all-comments').html();

            return {
                title,
                description: art(path.join(__dirname, 'templates/topic.art'), {
                    article,
                    comment,
                }),
                category: categoryName,
                link: itemLink,
                pubDate: parseDate($('.timeago').attr('title'), 'YYYY/MM/DD'),
            };
        })
    );

    const title = $('.sidebar .community-details .header span').text();
    $('.sidebar .community-details .main div div a').remove();
    const description = $('.sidebar .community-details .main div div').text();
    const categoryTitle = new Map([
        ['translations', { name: '翻译' }],
        ['jobs', { name: '招聘' }],
        ['qa', { name: '问答' }],
        ['links', { name: '链接' }],
        ['', { name: '最新' }],
    ]);
    ctx.state.data = {
        title: `LearnKu - ${title} - ${categoryTitle.get(category).name}`,
        link: url,
        description,
        item: item.filter((item) => item !== ''),
    };
};
