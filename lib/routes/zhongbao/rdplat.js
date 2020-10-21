const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category; // https://www.rdplat.com/leaderTask/index?parameter=m101

    const geturl = `https://www.rdplat.com/leaderTask/index?parameter=${category}`;

    console.log(geturl);
    const response = await got({
        method: 'get',
        url: `${geturl}`,
        headers: {
            Host: 'www.rdplat.com',
            // Referer: 'https://www.rdplat.com/',
        },

    });
    console.log("get response");
    const responseHtml = response.data;
    // console.log("decode ok");
    // console.log('responseHtml',responseHtml);
    const $ = cheerio.load(responseHtml);
    const categorytitle = $('title').text().trim();
    const content = $('meta[name="description"]').attr('content');
    const div = $('div[id="result"]>div[class="demand_search_result"]>ul');
    const taskList = div.find('li').map((i, e) => $(e).find('a').attr('href')).get();

    // console.log("taskList :" + taskList);
    // console.log('taskList :' + taskList.length);
    const resultItem = await Promise.all(
        taskList.map(async (i) => {
            const url = i;
            const task = {
                        title: ``,
                        description: '',
                        link: `${url}`,
                    };
            const key = `${url}`;
            const value = await ctx.cache.get(key);
            if (value) {
                return Promise.resolve(JSON.parse(value));
            } else {
                const taskDetail = await got({
                    method: 'get',
                    url: `${url}`,
                });
                // console.log('get from :' + url);
                const $ = cheerio.load(taskDetail.data);
                const titlename = $('title').text().trim();
                // console.log('titlename :' + titlename);
                task.title = titlename.split('最新外包,众包需求-开发宝')[0];
                try {
                    task.description = $('div[class="text_shadow_area text_shadow_area1"]').html() + $('div[class="text_shadow_area text_shadow_area2"]').html();
                    const myDate = $('div.task_number_time>span').slice(1,2).text();
                    if (myDate) {
                    // console.log("myDate:"+myDate);
                    task.pubDate = new Date(myDate).toUTCString();
                    } else {
                        return Promise.resolve(null);
                    }
                    // console.log('description :' + task.description);
                    // console.log('pubDate :' + task.pubDate);
                } catch (e) {
                      // logger.error(`Error in imgur upload ${filePath}`, e);
                    console.log("ignore error:" + e);
                    return Promise.resolve(null);
                }

                ctx.cache.set(key, JSON.stringify(task), 24 * 60 * 60);
                // console.log(i+" set cache_data:");
            }
            // console.log(i+" return");
            return Promise.resolve(task);
        })
    );

    ctx.state.data = {
        title: `${categorytitle}`,
        link: `${geturl}`,
        description: `${content}`,
        item: resultItem,
    };
    console.log("title:" + ctx.state.data.title);
    console.log("link:" + ctx.state.data.link);
    console.log("description:" + ctx.state.data.description);
    console.log("resultItem: " + ctx.state.data.item.length);
    for (let i = 0; i < ctx.state.data.item.length; i++) {
        if (ctx.state.data.item[i])
        {
            console.log(i + ": " + ctx.state.data.item[i].title);
            console.log(i + ": " + ctx.state.data.item[i].pubDate);
            console.log(i + ": " + ctx.state.data.item[i].link);
            // console.log(i+": "+ctx.state.data['item'][i].description);
        }
    }
};
