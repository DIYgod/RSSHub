const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
  let baseUrl;
  let lang = ctx.params.lang;
  switch (lang) {
	case 'en':
	  baseUrl = 'https://www.mclaren.com';
	  lang = 'en-UK';
	  break;
	case 'zh':
	  baseUrl = 'https://cn.mclaren.com';
	  lang = 'zh-CN';
	  break;
	case 'es':
	  baseUrl = 'https://es.mclaren.com';
	  lang = 'es-ES';
	  break;
	default:
	  throw Error(`Language '${lang}' is not supported.`);
  };
  const rssUrl = baseUrl + '/racing/articles/';

  const { category = 'all' } = ctx.params;
  switch (category) {
	case 'all':
	  break;
	default:
	  throw Error(`Category '${category}' is not supported.`);
  };

  const response = await got(rssUrl);

  const data = response.data;
  const $ = cheerio.load(data);
  const title = $('title').text();
  const description = $('meta[name="description"]').attr('content');
  const list = $('ul[class="start-grid__list  clearfix"] li').not('[style]')
	.map((index, item) => {
	  item = $(item);
	  const thumbnailUrl = item.find('div.start-grid-content__img').attr('style').slice(22, -2);
	  return {
		title: item.find('h3.link-inner').text(),
		link: baseUrl + item.find('a.start-grid-content__link').attr('href'),
		description: thumbnailUrl,	// Pass the thumbnail image just in case
	  };
	}).get();

  const items = await Promise.all(
	list.map(async (item) => {
	  const itemRep = await ctx.cache.tryGet(item.link, async () =>
		(await got.get(item.link)).data);
	  const body = cheerio.load(itemRep);
	  body('div.livestream--wrapper').remove();
	  const datetime = Date.parse(
		body('time[datetime]').attr('datetime')
	  );
	  let imgUrl = body('a.imgwrapper').attr('data-imageurl-large');
	  if (!imgUrl) {
		imgUrl = item.description;
	  }
	  const content = body('div.article-body');
	  const entry = {
		title: item.title,
		link: item.link,
		description: `<center><img src="${imgUrl}"></center>` + content.html(),
		pubDate: datetime,
	  };
	  return Promise.resolve(entry);
    })
  );

  ctx.state.data = {
    language: lang,
	title,
	description,
    link: rssUrl,
	item: items,
  };
};
