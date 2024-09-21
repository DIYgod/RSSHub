const got = require('@/utils/got');
const { CookieJar } = require('tough-cookie');
const config = require('@/config').value;
const logger = require('@/utils/logger');

let loginFlag;
const cookieJar = new CookieJar();

if (config.dida365.username && config.dida365.password) {
    got({
        method: 'post',
        url: 'https://api.dida365.com/api/v2/user/signon?wc=true&remember=true',
        cookieJar,
        json: {
            username: config.dida365.username,
            password: config.dida365.password,
        },
    })
        .then(() => {
            loginFlag = true;
            logger.info('Dida365 login success.');
        })
        .catch(() => {
            logger.error('Dida365 login fail.');
        });
}

module.exports = async (ctx) => {
    if (loginFlag) {
        const habitsRes = await got.get({
            url: 'https://api.dida365.com/api/v2/habits',
            cookieJar,
        });
        const habits = habitsRes.data;

        const paramsList = [];
        for (const item of habits) {
            paramsList.push(['habitIds', item.id]);
        }
        const searchParams = new URLSearchParams(paramsList);

        const habitCheckinsRes = await got.get({
            url: 'https://api.dida365.com/api/v2/habitCheckins',
            cookieJar,
            searchParams,
        });
        const checkins = habitCheckinsRes.data;
        const habitRecordsRes = await got.get({
            url: 'https://api.dida365.com/api/v2/habitRecords',
            cookieJar,
            searchParams,
        });
        const records = habitRecordsRes.data;

        let list = [];
        for (const habitId in checkins.checkins) {
            const info = habits.find((item) => item.id === habitId);
            list = [
                ...list,
                ...checkins.checkins[habitId]
                    .sort((a, b) => a.checkinStamp - b.checkinStamp)
                    .filter((checkin) => checkin.value)
                    .map((checkin, index) => {
                        const record = records.habitRecords[checkin.habitId].find((re) => re.stamp === checkin.checkinStamp);
                        return {
                            title: `第${index + 1}天${info.name}打卡`,
                            description: record && record.content,
                            pubDate: `${(checkin.checkinStamp + '').slice(0, 4)}-${(checkin.checkinStamp + '').slice(4, 6)}-${(checkin.checkinStamp + '').slice(6, 8)}`,
                            link: `https://dida365.com/webapp/#q/all/habit/${checkin.habitId}`,
                            guid: checkin.id,
                        };
                    }),
            ];
        }

        ctx.state.data = {
            title: '滴答清单打卡',
            link: 'https://dida365.com/webapp/#q/all/habit/',
            item: list,
        };
    } else {
        throw new Error('Login required');
    }
};
