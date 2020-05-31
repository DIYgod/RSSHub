const utils = require('./utils');

module.exports = async (ctx) => {
    // number is shorthand for company
    // id is ticket number
    // phone for shunfeng :)
    const { number, id, phone } = ctx.params;

    // I am doing these to avoid invaild request.
    // First, check if code is vaild
    const { status, message, company } = await utils.checkCode(ctx, number, id, phone);

    let data;
    let query;
    const time = new Date().toString();

    if (status) {
        query = await utils.getQuery(ctx, number, id, phone);
        if (query.status !== '200') {
            data = [
                {
                    context: query.message,
                    time,
                },
            ];
        } else {
            data = query.data;
        }
    } else {
        throw new Error(`[本地]信息有误，请检查后重试：${message}`);
    }

    // Maybe we can look into isCheck, condition, and state :)
    // But I just want to make it work for now.
    ctx.state.data = {
        title: `快递 ${company.name}-${id}`,
        link: 'https://www.kuaidi100.com',
        description: `快递 ${company.name}-${id}`,
        item: data.map((item) => ({
            title: item.context,
            description: item.context,
            guid: new Date(item.time || item.ftime).toUTCString(),
            pubDate: new Date(item.time || item.ftime).toUTCString(),
            link: 'https://www.kuaidi100.com',
        })),
    };
};
