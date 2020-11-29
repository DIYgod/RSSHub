const got = require('@/utils/got');
const formatPubDate = require('@/utils/date');
const cheerio = require('cheerio');
const FormData = require('form-data');

const indexApi = 'https://latepost.com/site/index';
const homePage = 'https://latepost.com';

const dateAdapter = (date) => {
    const incompleteDate = ['今天', '昨天', '前天'];
    if (incompleteDate.indexOf(date) !== -1) {
        return `${date} 00:00`;
    } else {
        return date;
    }
};

module.exports = async (ctx) => {
    const formData = new FormData();
    formData.append('page', 1);
    formData.append('limit', 19);

    const [first, response] = await Promise.all([
        got({ method: 'get', url: homePage }),
        got({
            method: 'post',
            url: indexApi,
            body: formData,
        }),
    ]);

    const $ = cheerio.load(first.data);
    const firstItem = {};
    firstItem.title = $('.headlines-title a').text();
    firstItem.detail_url = `${$('.headlines-title a').attr('href')}`;

    const data = [firstItem].concat(response.data.data || []);

    const items = data.map((item) => ({
        title: item.title,
        description: item.abstract,
        link: `${homePage}${item.detail_url}`,
    }));

    ctx.state.data = {
        title: '晚点LatePost',
        link: homePage,
        description: '晚点LatePost-最新报道',
        item: await Promise.all(
            items.map(
                async (item) =>
                    await ctx.cache.tryGet(item.link, async () => {
                        const res = await got({ method: 'get', url: item.link });
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
