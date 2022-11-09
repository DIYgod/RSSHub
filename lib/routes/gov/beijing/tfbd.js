const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const root_url = 'http://tfbd.ccf.org.cn';

const config = {
  xwdt: {
    title: '新闻动态', child: {
      tzgg: { title: '通知公告' },
      wydt: { title: '委员动态' },
    }
  },
  pphd: {
    title: '品牌活动', child: {
      xsjl: { title: '学术交流' },
      jsjl: { title: '技术交流' },
      cjds: { title: '创建大赛' },
      zlyj: { title: '战略研究' },
      jy: { title: '教育' },
      top10dsjyy: { title: 'Top10大数据应用' },
      zjxl: { title: '走进系列' },
    }
  },
  ljhd: {
    title: '历届活动', child: {
      xsjl: { title: '学术交流' },
      jsjl: { title: '技术交流' },
      cxds: { title: '创新大赛' },
    }
  },
};

module.exports = async (ctx) => {
  const caty = ctx.params.caty;
  const id = ctx.params.id;
  const catyCfg = config[caty];
  if (!catyCfg) {
    throw Error('Bad category. See <a href="https://docs.rsshub.app/government.html#da-shu-ju-zhuan-jia-wei-yuan-hui">docs</a>');
  }
  const cfg = catyCfg.child[id];
  if (!cfg) {
    throw Error('Bad category. See <a href="https://docs.rsshub.app/government.html#da-shu-ju-zhuan-jia-wei-yuan-hui">docs</a>');
  }

  const current_url = url.resolve(root_url, `/tfbd/${caty}/${id}/`);
  const response = await got({
    method: 'get',
    url: current_url,
  });
  const $ = cheerio.load(response.data);
  const list = $('div.file-list div.article-item')
    .slice(0, 10)
    .map((_, item) => {
      item = $(item);
      const a = item.find('h3 a[href]');
      const p = item.find('p');
      const href = a.attr('href');
      return {
        title: a.text(),
        link: url.resolve(current_url, href),
        pubDate: p.text(),
      };
    })
    .get();

  const items = await Promise.all(
    list.map(
      async (item) =>
        await ctx.cache.tryGet(item.link, async () => {
          let description = '';
          try {
            const res = await got({ method: 'get', url: item.link });
            const content = cheerio.load(res.data);
            description = content('div.articleCon').html();
          } catch (error) {
            description = '页面找不到';
          }
          item.description = description;
          return item;
        })
    )
  );

  ctx.state.data = {
    title: '大数据专家委员会 - ' + cfg.title,
    link: root_url,
    item: items,
  };
};
