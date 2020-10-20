const logger = require('../../utils/logger');
const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    
    const category = ctx.params.category;
    
    const curDate = new Date().format("yyyy-MM-dd+hh:mm:ss");
    const geturl = `https://zb.oschina.net/project/contractor-browse-project-and-reward?applicationAreas=${encodeURI(category)}&sortBy=30&currentTime=${curDate}&pageSize=10&currentPage=1`;
    //console.log(geturl);
    const response = await axios({
        method: 'get',
        url: `${geturl}`,
    });

    const data = response.data.data.data;
    //console.log(data);
    ctx.state.data = {
        title: category,
        link: `${geturl}`,
        description: category,
        item: data.map((item) => ({
            title: item.name,
            description: item.name,
            content: item.name,
            pubDate: item.publishTime,
            guid: item.id,
            link: `https://zb.oschina.net/project/detail.html?id=${item.id}`,
            author: item.userAccountNickname,
        })),
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
