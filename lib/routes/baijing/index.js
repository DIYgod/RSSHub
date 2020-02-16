const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'post',
        url: 'http://www.baijingapp.com/api/get_more_articles/',
        responseType: 'json',
        form: {
            deviceid: 'ios',
            page: 1,
        },
    });

    const resList = response.data;

    // json字符串转json对象
    const resListObj = new Function('return ' + resList)();

    if (resListObj.state === 1) {
        const output = resListObj.data.list.map((item) => {
            const title = item.title;
            const link = 'https://www.baijingapp.com/article/' + item.id;
            const time = item.time;
            const author = item.user_name;
            const image = item.image;
            const single = {
                title,
                link,
                time,
                author,
                image,
            };

            return single;
        });

        ctx.state.data = {
            title: `白鲸出海`,
            desription: '白鲸出海 - 泛互联网出海服务平台',
            item: output,
        };
    }
};
