const got = require('@/utils/got');

module.exports = async (ctx) => {
    const category = ctx.params.category;

    const response = await got({
        method: 'get',
        url: `http://cablenews.i-cable.com/ci/news/listing/api`,
        headers: {
            Referer: `http://cablenews.i-cable.com/ci/news/listing`,
        },
    });

    const data = response.data;
    console.log(data);
    const jsonData = JSON.parse(data);
    console.log(jsonData);

    ctx.state.data = null;
};