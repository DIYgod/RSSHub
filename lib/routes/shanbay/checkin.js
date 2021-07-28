const got = require('../../utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const username = await ctx.cache.tryGet(`shanbayuser${id}`, async () => {
        const response = await got({
            method: 'get',
            url: `https://web.shanbay.com/web/checkin/achievement?user_id=${id}`,
        });
        const $ = cheerio.load(response.data);
        return $('#user-info-area .name').text();
    });

    const response = await got({
        method: 'get',
        url: `https://apiv3.shanbay.com/uc/checkin/logs?page=1&user_id=${id}`,
        headers: {
            Referer: `https://web.shanbay.com/web/wechat/calendar/?user_id=${id}`,
        },
    });

    const data = response.data.objects;

    ctx.state.data = {
        title: `${username} 的扇贝打卡`,
        link: `https://web.shanbay.com/web/wechat/calendar/?user_id=${id}`,
        item:
            data &&
            data.map((item) => {
                let action = '';
                item.tasks = item.tasks.sort((a, b) => b.used_time - a.used_time);
                item.tasks.forEach((task, index) => {
                    const minute = Math.floor(task.used_time / 60);
                    const second = task.used_time - minute * 60;
                    action += `${index === 0 ? '' : '；'}${task.operation}了 ${task.num} ${task.unit}${task.name}，学习时间 ${minute} 分 ${second} 秒`;
                });
                return {
                    title: `${username} 的第 ${item.checkin_days_num} 天扇贝打卡`,
                    pubDate: new Date(`${item.date} 00:00:00+08`),
                    guid: item.id + (+new Date(`${item.date} 00:00:00+08`) >= 1596729600000 ? action : ''),
                    description: action,
                    link: `https://web.shanbay.com/web/wechat/calendar/?user_id=${id}`,
                };
            }),
    };
};
