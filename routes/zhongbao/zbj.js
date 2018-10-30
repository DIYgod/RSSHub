const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;//https://task.zbj.com/t-qrsrj
    
    const geturl = `https://task.zbj.com/t-${category}`;

    //console.log(geturl)
    const response = await axios({
        method: 'get',
        url: `${geturl}`,
        headers: {
            Host: 'task.zbj.com',
            Referer: 'https://task.zbj.com/',
        },
    });
    //console.log("get response");
    const responseHtml = response.data; 
    const $ = cheerio.load(responseHtml);
    const categorytitle = $('title').text().trim();
    const content = $('meta[name="description"]').attr('content');
    const div = $('div.demand-list');
    const taskList = div.find('div.demand>a').map((i, e) => $(e).attr('href'))
        .get();
    
    //console.log("taskList :" + taskList); 
    //console.log('taskList :' + taskList.length);
    const resultItem = await Promise.all(
        taskList.map(async (i) => {
            const url = 'https:' + i;
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
                const taskDetail = await axios({
                    method: 'get',
                    url: `${url}`,
                });
                //console.log('get from :' + url);
                const $ = cheerio.load(taskDetail.data);
                const titlename = $('title').text();
                //console.log('titlename :' + titlename);
                task.title = titlename.split('-')[0]
                const describeArea = $('div[class="describe-area js-describe-area"]');
                try {
                     
                    task.description = describeArea.html();
                    const myDate = describeArea.find('p.pub-task-date').text().trim();
                    //console.log("myDate:"+myDate);
                    task.pubDate = new Date(myDate).toUTCString();
                    //console.log('description :' + task.description);
                    //console.log('pubDate :' + task.pubDate);
                } catch (e) {
                    task.description = ''
                    task.pubDate  = new Date(0);
                    //logger.error(`Error in imgur upload ${filePath}`, e);
                    console.log("ignore error:"+e);
                }

                ctx.cache.set(key, JSON.stringify(task), 24 * 60 * 60);
                //console.log(i+" set cache_data:");
            }
            //console.log(i+" return");
            return Promise.resolve(task);
        })
    );

    ctx.state.data = {
        title: `${categorytitle}`,
        link: `${geturl}`,
        description: `${content}`,
        item: resultItem,
    };
    console.log("title:"+ctx.state.data['title']);
    console.log("link:"+ctx.state.data['link']);
    console.log("description:"+ctx.state.data['description']);
    //console.log("resultItem: "+resultItem.length);
    for (let i = 0; i < ctx.state.data['item'].length; i++) {
        console.log(i+": "+ctx.state.data['item'][i].title);
        console.log(i+": "+ctx.state.data['item'][i].pubDate);
    }
};
