const got = require('@/utils/got');
const formatPubDate = require('@/utils/date');
const cheerio = require('cheerio');
const FormData = require('form-data');

const titles = {
    '': '最新报道',
    1: '晚点独家',
    2: '人物访谈',
    3: '晚点早知道',
    4: '长报道',
};

const rootUrl = 'https://www.latepost.com';

const dateAdapter = (date) => {
    const incompleteDate = ['今天', '昨天', '前天'];
    if (incompleteDate.indexOf(date) !== -1) {
        return `${date} 00:00`;
    } else {
        return date;
    }
};

module.exports = async (ctx) => {
    const proma = ctx.params.proma || '';
    const formData = new FormData();
    formData.append('page', 1);
    let data;
    if (proma === '') {
        const apiUrl = `${rootUrl}/site/index`;
        formData.append('limit', 9);
        const [first, response] = await Promise.all([
            got({ method: 'get', url: rootUrl }),
            got({
                method: 'post',
                url: apiUrl,
                body: formData,
            }),
        ]);
        const $ = cheerio.load(first.data);
        const firstItem = {};
        firstItem.title = $('.headlines-title a').text();
        firstItem.detail_url = `${$('.headlines-title a').attr('href')}`;
        data = [firstItem].concat(response.data.data || []);
    } else {
        const apiUrl = `${rootUrl}/news/get-news-data`;
        formData.append('limit', 10);
        const response = await got({
            method: 'post',
            url: apiUrl,
            body: formData,
        });
        data = response.data.data;
    }

    const items = data.map((item) => ({
        title: item.title,
        description: item.abstract,
        link: `${rootUrl}${item.detail_url}`,
    }));

    ctx.state.data = {
        title: `晚点LatePost-${titles[proma]}`,
        link: rootUrl,
        item: await Promise.all(
            items.map(
                async (item) =>
                    await ctx.cache.tryGet(item.link, async () => {
                        const res = await got({ method: 'get', url: item.link });
                        // 优化排版
                        const $ = cheerio.load(
                            res.data
                                .replace(/<p class="ql-align-justify"><br><\/p>/g, '')
                                .replace(/<p class="ql-align-center"><br><\/p>/g, '')
                                .replace(/<p><br><\/p>/g, '')
                        );
                        item.description = $('.article .abstract').html() + $('.article .article-body').html();
                        item.pubDate = formatPubDate(dateAdapter($('.article-header-date').text()));
                        return item;
                    })
            )
        ),
    };
};
