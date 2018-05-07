const axios = require('axios');
const template = require('../../utils/template');
const cheerio = require('cheerio');
const config = require('../../config');

const baseUrl = 'https://toutiao.io';
let requestUrl = `${baseUrl}/subjects/userID?f=new`
module.exports = async (ctx)=>{
    const id = ctx.params.id;
    requestUrl = requestUrl.replace('userID',id);
    const response = await axios({
        method:'get',
        url:requestUrl,
        headers: {
            'User-Agent': config.ua,
            'Host':'toutiao.io'
        },
        responseType: 'text'
    });
    const $ = cheerio.load(response.data);
    const image = $('#main').find('.text-center>.subject-cover>img').eq(0).attr('src');
    const link = requestUrl;
    const title = $('#main').find('.text-center>h3').eq(0).text();
    const description = $('#main').find('.social-share-button').eq(0).attr('data-title');

    const list = $('.posts>.post', '#main');
    const article_item = [];
    for(let i=0;i<list.length;i++){
        const article_el = $(list[i]).find('.content').eq(0);
        const item = {
            title: article_el.find('a').eq(0).text(),
            link: baseUrl + article_el.find('a').eq(0).attr('href')
        };
        article_item.push(item);
    };
    ctx.body = template({
        title: '开发者头条独家号:'+title,
        description:description,
        image: image,
        link: baseUrl,
        item: article_item,
    });
};
