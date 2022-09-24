const got = require('@/utils/got');
const dayjs = require('dayjs');

const baseUrl = 'https://islander.cc';

module.exports = async (ctx) => {
    const today = dayjs().format('YYYY-MM-DD');
    const { data: response } = await got(`${baseUrl}/api/v1/events/top30`, {
        searchParams: {
            date: today,
        },
    });

    const items = response.eventList.map((item) => ({
        title: item.eventTitle,
        description: JSON.parse(item.eventSummary).join('<br>'),
        link: `${baseUrl}/events/${item.eventId}`,
        category: [item.news_category, ...item.tags],
    }));

    ctx.state.data = {
        title: `${today} Top 30 熱門事件 | 島民衛星 Islander`,
        description: `${today} 這天前三十熱門的事件`,
        link: `${baseUrl}/top30event`,
        image: 'https://islander.cc/islander_og_image.png',
        item: items,
    };
};
