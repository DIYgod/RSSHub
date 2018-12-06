const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const { userId } = ctx.params;
    const response = await axios({
        method: 'get',
        url: `https://apiv3.shanbay.com/uc/checkin/logs?page=1&user_id=${userId}`,
    });

    const items = response.data.objects.map((item) => {
        const title = `${userId} 第${item.checkin_days_num}天打卡 ${item.date}`;
        const description = item.tasks.reduce((description, item) => {
            description += `${item.operation}了 ${item.num} ${item.unit}${item.name}<br>`;
            return description;
        }, '');
        return {
            title,
            description: `
        ${title}<br><br>
        ${description}
      `,
            guid: item.id,
            pubDate: new Date(item.date).toUTCString(),
        };
    });

    ctx.state.data = {
        title: `扇贝打卡-${userId}`,
        item: items,
    };
};
