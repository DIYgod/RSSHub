const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

async function getData(category, id) {
    const url = `https://radio.cgtn.com/downapiRES/radio/v1/program/historyList/programId${id}_category${category}_page1.json`;
    const response = await got(url);
    return response.data;
}

function combDate(date, time) {
    // combine date and time, return a Date object
    return timezone(parseDate(date + ' ' + time), +8);
}

module.exports = async (ctx) => {
    const { category, id } = ctx.params;
    const categoryMap = { ezfm: 1, other: 5 };
    const data = await getData(categoryMap[category], id);
    const items = data.data.map((item) => ({
        title: item.title,
        pubDate: combDate(item.showDate, item.time.split(' ')[0]),
        description: item.programSeries.content || item.detail,
        itunes_item_image: item.programUrl,
        itunes_duration: item.duration,
        enclosure_url: item.mediaUrl,
        enclosure_type: 'audio/mpeg',
    }));
    ctx.state.data = {
        title: `中国环球电视网 CGTN Podcast - ${data.info}`,
        link: 'https://www.cgtn.com/radio/',
        item: items,
        description: String(data.info),
    };
};
