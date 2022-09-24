const got = require('@/utils/got');
const dayjs = require('dayjs');
const { parseDate } = require('@/utils/parse-date');
const baseUrl = 'https://islander.cc';

module.exports = async (ctx) => {
    const today = dayjs();
    const startDate = today.subtract(13, 'day').format('YYYY-MM-DD');
    const endDate = today.format('YYYY-MM-DD');
    const { data: response } = await got(`${baseUrl}/api/v2/search`, {
        searchParams: {
            query: '',
            searchType: 'event',
            startDate,
            endDate,
        },
    });

    const items = response.rankingEvents.map((item) => ({
        title: item.title,
        link: `${baseUrl}/events/${item.groupId}`,
        pubDate: parseDate(item.date),
        category: [item.category, ...item.tags],
    }));

    ctx.state.data = {
        title: `事件分析 | 島民衛星 Islander`,
        description: `島民衛星為台灣⼈工智慧實驗室所開發之新聞資訊平台，旨在運用 AI 提供民眾便於接觸各類議題與各類媒體之平台，並呈現各家媒體特色以協助民眾自主選擇。`,
        link: `${baseUrl}/?query=&searchType=event&startDate=${startDate}&endDate=${endDate}`,
        image: 'https://islander.cc/islander_og_image.png',
        item: items,
    };
};
