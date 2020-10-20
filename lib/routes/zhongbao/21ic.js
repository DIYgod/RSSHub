const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const geturl = `http://project.21ic.com/list/${category}/`;  //http://project.21ic.com/list/cid25_cidd75
    const response = await axios({
        method: 'get',
        url: `${geturl}`,
        headers: {
            Referer: 'http://project.21ic.com',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const categorytitle = $('title').text().trim();
    const content = $('meta[name="keywords"]').attr('content');
    const div = $('div.xiang_con>div.xin_con');
    const taskList = div.find('dl.user-information').map((i, e) => $(e).find('dd.user_top>a.tit').attr('href'))
        .get();
    
    //console.log("taskList :" + taskList); 
    //console.log('taskList :' + taskList.length);
    const resultItem = await Promise.all(
        taskList.map(async (i) => {
            const url = 'http://project.21ic.com' + i;
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
                task.title = titlename.split('—')[0]
                try {
                     
                    task.description = $('div.xiang_con').html();
                    const myDate = $('div[id="container"]>div.nei_box>ul[class="nei_box_r fl"]>div.xiang2_shun>ul>li.gray>p').slice(1,2).text().trim();
                    if(myDate) {
                    //console.log("myDate:"+myDate);
                    task.pubDate = new Date(myDate).toUTCString();
                    } else {
                        task.pubDate = 0
                        return Promise.resolve(null);
                    }
                    //console.log('description :' + task.description);
                    //console.log('pubDate :' + task.pubDate);
                } catch (e) {
                      //logger.error(`Error in imgur upload ${filePath}`, e);
                    console.log("ignore error:"+e);
                    return Promise.resolve(null);
                }

                ctx.cache.set(key, JSON.stringify(task), 24 * 60 * 60);
                //console.log(i+" set cache_data:");
            }
            //console.log(i+" return");
            return Promise.resolve(task);
        })
    );


    //console.log("start filter" + resultItem +"\n"+typeof(resultItem))
    const resultItem1 = resultItem.filter( function(s) { return s;})
    //console.log("end filter"+resultItem1 + " len " + resultItem1.length)


    ctx.state.data = {
        title: `${categorytitle}`,
        link: `${geturl}`,
        description: `${content}`,
        item: resultItem1,
    };
    console.log("title:"+ctx.state.data['title']);
    console.log("link:"+ctx.state.data['link']);
    console.log("description:"+ctx.state.data['description']);
    console.log("resultItem: "+ctx.state.data['item'].length);
    for (let i = 0; i < ctx.state.data['item'].length; i++) {
        if(ctx.state.data['item'][i])
        {
            console.log(i+": "+ctx.state.data['item'][i].title);
            console.log(i+": "+ctx.state.data['item'][i].pubDate);
        }
    }
};
