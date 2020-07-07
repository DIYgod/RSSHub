const got = require('@/utils/got');
const cheerio = require('cheerio');

/**
 * 在一个CheerioElement数组中查找有你想要的属性的元素
 * @author KotoriK
 * @param {Array<CheerioElement>} eles CheerioElement数组
 * @param {string} attrName 要查找的属性名称
 * @param {boolean} recursive 是否递归子节点
 * @returns 有你想要元素的数组
 */
function findAttributeFromNodes(eles, attrName, recursive = false) {
    let array = [];
    for (const ele of eles) {
        if (ele.attribs && ele.attribs[attrName]) {
            array.push(ele);
        }
        if (recursive && ele.children) {
            array = array.concat(findAttributeFromNodes(ele.children, attrName, true));
        }
    }
    return array;
}

/**
 * 在一个CheerioElement数组中查找有你给的属性及对应的值的元素
 * @author KotoriK
 * @param {Array<CheerioElement>} eles CheerioElement数组
 * @param {string} attrName 要查找的属性名称
 * @param {boolean} recursive 是否递归子节点
 * @returns 有你想要元素的数组
 */
function findMatch(eles, attrName, value, recursive = false) {
    let array = [];
    for (const ele of eles) {
        if (ele.attribs && ele.attribs[attrName] === value) {
            array.push(ele);
        }
        if (recursive && ele.children) {
            array = array.concat(findMatch(ele.children, attrName, value, true));
        }
    }
    return array;
}

module.exports = async (ctx) => {
    const cat_id = ctx.params.cat;
    const response = await got({
        method: 'get',
        url: `http://www.niaogebiji.com/cat/${cat_id}`,
    });
    const $ = cheerio.load(response.data);
    const cat_name = $('h1').text();
    const articles = $('div.articleBox.clearfix');
    ctx.state.data = {
        title: `鸟哥笔记-分类-${cat_name}`,
        link: `http://www.niaogebiji.com/cat/${cat_id}`,
        item: response.data
            ? await Promise.all(
                  articles.toArray().map((element) => {
                      const article_div = findAttributeFromNodes(element.children, 'href')[0];
                      const article_link = `http://www.niaogebiji.com${article_div.attribs.href}`;
                      return (async () => ({
                          title: findMatch(article_div.children, 'class', 'articleTitle elp', true)[0].children[0].data,
                          category: cat_name,
                          description: await ctx.cache.tryGet(`ngbj-${article_div.attribs.href}`, async () => {
                              // get article
                              const article_response = await got({
                                  method: 'get',
                                  url: article_link,
                              });
                              const article_dom = cheerio.load(article_response.data);
                              return article_dom('div.mobileHide.pc_content').html();
                          }),
                          link: article_link,
                          pubDate: parseInt(element.attribs['data-timepoint'] + '000'),
                      }))();
                  })
              )
            : [
                  {
                      title: '获取失败！',
                  },
              ],
    };
};
