const got = require('@/utils/got');
const cheerio = require('cheerio');
//const dateParser = require('@/utils/dateParser');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
	const district = ctx.params.district;
	const queryUrl = district ? `https://t.me/s/nCoV2019?q=%23${encodeURIComponent(district)}` : `https://t.me/s/nCoV2019`;
	const response = await got.get(queryUrl);
	const $ = cheerio.load(response.data);
	const list = $('.tgme_widget_message_bubble');
	
	if (list.length === 0 && $('.tgme_channel_history').length === 0) {
        throw `Unable to fetch message feed from this channel. Please check this URL to see if you can view the message preview: https://t.me/s/${username}`;
    }
    
    reg1 = new RegExp(/^(<br>)?【|】(<br>)?$/g);
    reg2 = new RegExp(/^(<br>)?【|<a[^>]*>|<\/a[^>]*>|】(<br>)?$/g);
	ctx.state.data = {
        title: `${district ? `${district} ` : ''}CoVid-19疫情实时播报`,
        link: queryUrl,
        allowEmpty: true,
        image: $('.tgme_page_photo_image > img').attr('src'),
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
					
					// 关于标题：
					// 两端带有括号【】，并且被<b>标签包裹加粗
					//  <br>【 title 】<br>
					// ^    ^ ^     ^ ^    ^
					// 但是<b>标签可能出现在以上任何位置，需要加以判断
					
					const titles = item.find('div.tgme_widget_message_text.js-message_text > b');
					// 如果有多个标题则拼接起来
					const title = titles.map(function(i,el) {
						bNode = $(this);
						if (bNode.html().match(reg1) || $(this.prev).text()==='【' || $(this.next).text()==='【') {
							return bNode.html().replace(reg2,'');
						}
					}).get().join(' // ');
					
					if ( district && !(title.match(district)) ) {
						// 丢弃标题中不含关键词的条目
						return;
					}
					
					const description = item.find('div.tgme_widget_message_text.js-message_text').html();
					const link = item.find('.tgme_widget_message_date').attr('href');
                    const pubDate = parseDate(item.find('.tgme_widget_message_date > time').attr('datetime'));
					
                    return {
                        title,
                        description,
                        pubDate,
                        link,
                    };
                })
                .get()
                .reverse(),
    };
};