export default async (ctx) => {
    const { category } = ctx.params;
    let responseData;

    if (category === 'mzzlbg') {
        // 每周质量报告
        const getMzzlbg = await import('./utils/mzzlbg');
        responseData = await getMzzlbg();
    } else if (category === 'xinwen1j1') {
        // 新闻1+1
        const xinwen1j1 = await import('./utils/xinwen1j1');
        responseData = await xinwen1j1(category, ctx);
    } else {
        // 央视新闻
        const getNews = await import('./utils/news');
        responseData = await getNews(category, ctx);
    }

    ctx.state.data = responseData;
};
