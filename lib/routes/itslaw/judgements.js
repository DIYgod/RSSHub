const got = require('@/utils/got');

module.exports = async (ctx) => {
    const conditions = ctx.params.conditions || ''; // regulation+1121495748+13+中华人民共和国公司法（2018）第二十一条
    const pageUrl = 'http://www.itslaw.com/';

    const response = await got({
        method: 'get',
        url: `https://www.itslaw.com/api/judgements?sortType=2&category=CASE&startIndex=0&countPerPage=20&conditions=${encodeURIComponent(conditions)}"`,
        headers: {
            Referer: 'https://www.itslaw.com',
        },
    });

    const items = response.data.data.searchResult.judgements.map((item) => {
        const initialization = `{"category":"CASE","id":"${item.id}","anchor":null,"detailKeyWords":[""]}`;
        const single = {
            title: item.title,
            description: item.courtOpinion,
            pubDate: new Date(item.publishDate).toUTCString(),
            link: `https://www.itslaw.com/detail?initialization=${encodeURIComponent(initialization)}`,
        };
        return single;
    });

    ctx.state.data = {
        title: `无讼案例 - ${conditions}`,
        link: pageUrl,
        item: items,
    };
};
