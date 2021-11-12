const got = require('@/utils/got');
const cheerio = require('cheerio');

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
        item: list
            .map((item) => {
                const $ = cheerio.load(item);
                const categoryName = $('.category-name').text().trim();
                if (['置顶', '广告'].includes(categoryName)) {
                    return '';
                }
                $('.topic-title i').remove();
                return {
                    title: $('.topic-title').text().trim(),
                    category: categoryName,
                    link: $('.topic-title-wrap').attr('href'),
                    pubDate: new Date($('.timeago').attr('title')).toUTCString(),
                };
            })
            .filter((item) => item !== ''),
    };
};
