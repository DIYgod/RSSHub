const logger = require('../../utils/logger');
const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    
    const category = ctx.params.category;
    
    const curDate = new Date().format("yyyy-MM-dd+hh:mm:ss");
    const param = `putTime=&minPrice=&maxPrice=&isRemoteWork=&orderCondition=0&orderConfig=1&pageNo=1&searchName=&fitCode=0&workStyleCode=&jfId=&buId=&jieBaoType=&login=1&city=&orderType=&serviceTypeKey=${encodeURI(category)}&webSite=&webSign=`
    const geturl = `http://rc.jfh.com/jfportal/workMarket/getRequestData?${param}`;
    console.log(geturl);
    const response = await axios({
        method: 'get',
        url: `${geturl}`,
    });

    const data = response.data.resultList;
    //console.log("list :");
    console.log('data :' + data.length);
    ctx.state.data = {
        title: '解放号',
        link: `${geturl}`,
        description: `${category}`,
        item: data.map((item) => ({
            title: item.orderName,
            description: item.skillDomain+" || "+item.techDirection,
            content: item.price,
            pubDate: item.putTime,
            guid: item.orderNo,
            link: `https://rc.jfh.com/jfportal/all/detail/jf${item.orderNo}`,
            author: item.userAccountNickname,
        })),
    };
    console.log("title:"+ctx.state.data['title']);
    console.log("link:"+ctx.state.data['link']);
    console.log("description:"+ctx.state.data['description']);
    console.log("resultItem: "+ctx.state.data['item'].length);
    for (let i = 0; i < ctx.state.data['item'].length; i++) {
        console.log(i+": "+ctx.state.data['item'][i].title);
        console.log(i+": "+ctx.state.data['item'][i].pubDate);
    }
};
