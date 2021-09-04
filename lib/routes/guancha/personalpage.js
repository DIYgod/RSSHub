const got = require('@/utils/got');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const host = 'https://user.guancha.cn';
    const link = `https://app.guancha.cn/user/get-published-list?page_size=20&page_no=1&uid=${uid}`;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: host,
        },
    });
    const list = response.data.data.items;
    const user_nick = list[0].user_nick;

    /** Get time from relative time in HTML */
    function getpass_at(e) {
        const minuteRelativeTime = /(\d+)\s*分钟前/;
        const hourRelativeTime = /(\d+)\s*小时前/;
        const yesterdayRelativeTime = /昨天\s*(\d+):(\d+)/;
        const shortDate = /(\d+)-(\d+)\s*(\d+):(\d+)/;

        // offset to ADD for transforming China time to UTC
        const chinaToUtcOffset = -8 * 3600 * 1000;
        // offset to ADD for transforming local time to UTC
        const localToUtcOffset = new Date().getTimezoneOffset() * 60 * 1000;
        // offset to ADD for transforming local time to china time
        const localToChinaOffset = localToUtcOffset - chinaToUtcOffset;

        let time;
        if (e === '刚刚') {
            time = new Date();
        } else if (minuteRelativeTime.test(e)) {
            const rel = minuteRelativeTime.exec(e);
            time = new Date(Date.now() - parseInt(rel[1]) * 60 * 1000);
        } else if (hourRelativeTime.test(e)) {
            const rel = hourRelativeTime.exec(e);
            time = new Date(Date.now() - parseInt(rel[1]) * 60 * 60 * 1000);
        } else if (yesterdayRelativeTime.test(e)) {
            const rel = yesterdayRelativeTime.exec(e);
            // this time is China time data in local timezone
            time = new Date(Date.now() - 86400 * 1000 + localToChinaOffset);
            time.setHours(parseInt(rel[1]), parseInt(rel[2]), 0, 0);
            // transform back to china timezone
            time = new Date(time.getTime() - localToChinaOffset);
        } else if (shortDate.test(e)) {
            const rel = shortDate.exec(e);
            const now = new Date(Date.now() + localToChinaOffset);
            const year = now.getFullYear();
            // this time is China time data in local timezone
            time = new Date(year, parseInt(rel[1]) - 1, parseInt(rel[2]), parseInt(rel[3]), parseInt(rel[4]));
            // transform back to china timezone
            time = new Date(time.getTime() - localToChinaOffset);
        } else {
            time = new Date(e);
        }
        return time;
    }
    ctx.state.data = {
        title: `${user_nick}-观察者-风闻社区`,
        link: link,
        description: `${user_nick} 的个人主页`,
        item: list.map((item) => ({
            title: item.title,
            description: `${item.summary}`,
            pubDate: getpass_at(item.pass_at),
            link: `https://user.guancha.cn/main/content?id=${item.id}`,
            author: item.user_nick,
        })),
    };
};
