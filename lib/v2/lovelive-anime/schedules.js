const got = require('@/utils/got');
const path = require('path');
const { art } = require('@/utils/render');
const renderDescription = (desc) => art(path.join(__dirname, 'templates/scheduleDesc.art'), desc);
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

module.exports = async (ctx) => {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    const serie = ctx.params.serie;
    const category = ctx.params.category;
    const rootUrl = `https://www.lovelive-anime.jp/common/api/calendar_list.php`;
    const nowTime = dayjs();
    const dataPara = {
        year: nowTime.year(),
        month: nowTime.format('MM'),
    };
    if (serie && 'all' !== serie) {
        dataPara.series = [serie];
    }
    if (category && 'all' !== category) {
        dataPara.category = [category];
    }
    const response = await got(`${rootUrl}?site=jp&ip=lovelive&data=${JSON.stringify(dataPara)}`);

    const items = response.data.data.schedule_list.map((item) => {
        const link = item.url.select_url;
        const title = item.title;
        const category = item.categories.name;
        const eventStartDate = dayjs.unix(item.event_startdate).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss JST');
        const eventEndDate = dayjs.unix(item.event_enddate).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss JST');

        return {
            link,
            pubDate: item.start_endflg ? dayjs.unix(item.event_enddate).tz('Asia/Tokyo') : dayjs.unix(item.event_startdate).tz('Asia/Tokyo'),
            title,
            category,
            description: renderDescription({
                title,
                desc: item.event_dspdate,
                startTime: eventStartDate,
                endTime: eventEndDate,
            }),
        };
    });

    ctx.state.data = {
        title: `${category} - ${serie} - Love Live Official Website Schedule`,
        link: 'https://www.lovelive-anime.jp/schedule/',
        item: items,
        description:
            'The schedule date and other information shall be subject to the announcement on the official website. The RSS route has not been strictly tested, and the captured information cannot be guaranteed to be correct.',
    };
};
