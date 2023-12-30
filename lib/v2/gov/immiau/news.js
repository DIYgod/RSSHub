const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const url = 'https://immi.homeaffairs.gov.au/_layouts/15/api/Data.aspx/GetNews';

const reqBodyByYear = (year) => ({
    siteUrl: 'https://www.homeaffairs.gov.au',
    webUrl: '/News-subsite',
    filter: {
        Categories: [],
        PageNumber: 1,
        RowLimit: 20,
        ShowCurrentSiteOnly: false,
        CurrentSite: 'Immi',
        Year: year + '',
    },
});

const getItemUrl = (id) => `https://immi.homeaffairs.gov.au/news-media/archive/article?itemId=${id}`;

module.exports = async (ctx) => {
    const res = await got({
        method: 'post',
        url,
        json: reqBodyByYear(new Date().getFullYear()),
    }).json();

    const list = res.d.data.map((item) => ({
        title: item.Title,
        author: item.Source,
        category: item.Category,
        description: item.Content,
        pubDate: parseDate(item.Date),
        link: getItemUrl(item.Id),
    }));

    ctx.state.data = {
        title: 'News - Immigration and Citizenship',
        link: 'https://immi.homeaffairs.gov.au/news-media/archive',
        description: 'Australia Government, Department of Home Affairs',
        item: list,
    };
};
