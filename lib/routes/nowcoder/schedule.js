const got = require('@/utils/got');

module.exports = async (ctx) => {
    const propertyId = ctx.params.propertyId ? ctx.params.propertyId : 0;
    const typeId = ctx.params.typeId ? ctx.params.typeId : 0;

    const link = `https://www.nowcoder.com/school/schedule/data?token=&query=&typeId=${typeId}&propertyId=${propertyId}&onlyFollow=false&_=${new Date().getTime()}`;
    const responseBody = (await got.get(link)).data;
    if (responseBody.code !== 0) {
        throw Error(`接口错误，错误代码:${responseBody.code},错误原因:${responseBody.msg}`);
    }
    const data = responseBody.data;

    ctx.state.data = {
        title: '名企校招日程',
        link: 'https://www.nowcoder.com/school/schedule',
        description: '名企校招日程',
        item: data.map((item) => {
            let desc = `<tr><td><img src="${item.logo}" referrerpolicy="no-referrer""></td></tr>`;
            item.schedules.forEach((each) => {
                desc += `<tr><td>${each.content}</td><td>${each.time}</td></tr>`;
            });
            return {
                title: item.name,
                description: `<table>${desc}</table>`,
                pubDate: new Date(item.createTime).toUTCString(),
                link: `https://www.nowcoder.com/school/schedule/${item.id}`,
            };
        }),
    };
};
