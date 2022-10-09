const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

const map = new Map([
	[0, {title: '新闻中心', link: 'https://www.ece.pku.edu.cn/xwzx.htm'}],
	[1, {title: '学院新闻', link: 'https://www.ece.pku.edu.cn/xwzx/xyxw.htm'}],
	[2, {title: '通知公告', link: 'https://www.ece.pku.edu.cn/xwzx/tzgg.htm'}]
]);

module.exports = async (ctx) => {
	const type = Number.parseInt(ctx.params.type);

	if (type !== 0) {
		const id = map.get(type).link;
		// 发起 HTTP GET 请求
		const response = await got({
	    	method: 'get',
	    	url: String(id),
		});
		const data = response.data; // response.data 为 HTTP GET 请求返回的数据对象

		const $ = cheerio.load(data);
		const list = $('.list_box_sousuo');
    	const items = list &&
        	list
            	.map((index, item) => {
                	item = $(item);
                	return {
                    	title: item.find('a').attr('title'),
                    	link: item.find('a').attr('href'),
		    	pubDate: date(item.find('span').text()),
                	};
            	}).get();
	// console.log(items);

    	ctx.state.data = {
        	title: map.get(type).title + ' - pkuszcs',
        	link: map.get(type).link,
        	item: items,
    	};
	}
	else {
		const all = new Array();
		/* eslint-disable no-await-in-loop */
		for (let i = 1; i < 3; i++) {
			const id = map.get(i).link;
			// 发起 HTTP GET 请求
			const response = await got({
	    		method: 'get',
	    		url: String(id),
			});
			const data = response.data; // response.data 为 HTTP GET 请求返回的数据对象

			const $ = cheerio.load(data);
			const list = $('.list_box_sousuo');
    		const items = list &&
        	list
            	.map((index, item) => {
                	item = $(item);
                	return {
                    	title: item.find('a').attr('title'),
                    	link: item.find('a').attr('href'),
		    	pubDate: date(item.find('span').text()),
                	};
            	}).get();
		// console.log(items.constructor.name);

		for (let j = 0; j < items.length; j++) {
			// console.log(items[j]);
			all.push(JSON.parse(JSON.stringify(items[j])));
		}
		}
		/* eslint-enable no-await-in-loop */
	// console.log(all);
    	ctx.state.data = {
       		title: map.get(type).title + ' - pkuszcs',
       		link: map.get(type).link,
       		item: all,
   		};
	}


};
