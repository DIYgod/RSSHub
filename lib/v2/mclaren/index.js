const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
  let baseUrl, apiUrl;
  let title, description;
  let lang = ctx.params.lang;
  switch (lang) {
	case 'en':
	  baseUrl = 'https://www.mclaren.com';
	  title = 'McLaren Racing – Official Website';
	  description = 'Latest news and insight from McLaren Racing. Team and driver updates, videos and McLaren Formula 1 LIVE commentary.';
	  lang = 'en-UK';
	  break;
	case 'zh':
	  baseUrl = 'https://cn.mclaren.com';
	  title = '迈凯伦赛车 — 官方网站';
	  description = '来自迈凯伦一级方程式车队的最新消息。 查看车队和车手近况、视频以及比赛中的迈凯伦实况评论和实时数据。';
	  lang = 'zh-CN';
	  break;
	case 'es':
	  baseUrl = 'https://es.mclaren.com';
	  title = 'McLaren Racing - Sitio web oficial';
	  description = 'Consulta las últimas noticias del equipo de Fórmula 1 McLaren. Incluye información sobre el equipo, las últimas actualizaciones de los pilotos y McLaren LIVE, una aplicación con la que podrás seguir los comentarios en directo.';
	  lang = 'es-ES';
	  break;
	default:
	  throw Error(`Language '${lang}' is not supported.`);
  };

  const { category = 'all' } = ctx.params;
  const categoryArr = ['all', 'article', 'report', 'gallery', 'video', 'blog', 'photo_essay'];
  if (!categoryArr.includes(category)) {
    throw Error(`Category '${category}' is not supported.`);
  };

  const rssUrl = baseUrl + '/racing/articles/';
  apiUrl = baseUrl + '/racing/api/grid-search/?count=30&offset=0&type=';
  // count: number of requested entries; default to 16, up to 30.
  // offset: default to 0.
  if (category !== 'all') {
	apiUrl += category;
  }

  const response = await got(apiUrl);

  const html = response.data.html;
  const $ = cheerio.load(html);
  const list = $('li')
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
	  let embdVid = new String();
	  const vidId = body('a[data-video-id]').attr('data-video-id');
	  if (vidId !== undefined) {
		embdVid = `<p>Video:</p><iframe width="100%" height="100%" src="https://www.youtube.com/embed/${vidId}"></iframe>`;
	  }
	  body('div.livestream--wrapper').remove();
	  // Remove sildes that cannot be parsed properly
	  const datetime = Date.parse(
		body('time[datetime]').first().attr('datetime')
	  );
	  let imgUrl = body('a.imgwrapper').attr('data-imageurl-large');
	  if (!imgUrl) {
		imgUrl = item.description;
	  }
	  const content = body('div.article-body');
	  const entry = {
		title: item.title,
		link: item.link,
		description: `<center><img src="${imgUrl}"></center>${embdVid}`
		  .concat(content.html()),
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
