const libValue = ['https://lib.nwafu.edu.cn/gg/', '.pageList ul li', 'li a', '.pageArticle', `西北农林科技大学图书馆通知公告`];
const youthValue = ['https://54youth.nwsuaf.edu.cn/twsy/tzgg//', 'section ul li', 'li a', 'article', `共青团西北农林科技大学委员会通知公告`];
const cieValue = ['https://cie.nwsuaf.edu.cn/dtytz/tzgg/', 'ul.list  li', 'li a', '.article', `西北农林科技大学信息工程学院通知公告`];
const gsValue = ['https://gs.nwsuaf.edu.cn/tzggB/', 'dl#sort ul.list  li', 'li a', '.content', `西北农林科技大学后勤管理处通知公告`];
const jccValue = ['https://jcc.nwsuaf.edu.cn/tzgg/', 'dl#sort ul.list  li', 'li a', '.content', `西北农林科技大学计划财务处通知公告`];
const jiaowuValue = ['https://jiaowu.nwsuaf.edu.cn/tzggB/', '.list-i ul li', 'li a', 'article', `西北农林科技大学教务通知公告`];
const newsValue = ['https://news.nwafu.edu.cn/yxxw/', 'ul.NWAFU-list01  li', 'li a', '.pageArticle', `西北农林科技大学新闻网聚焦院处`];
const nicValue = ['https://nic.nwsuaf.edu.cn/tzgg1/', 'dl#sort ul.list  li', 'li a', '.content', `西北农林科技大学信息化管理处通知公告`];
const yjshyValue = ['https://yjshy.nwafu.edu.cn/tzgg/', '.sort_rightcont ul  li', 'li a', '.cont', `西北农林科技大学研究生院通知公告`];
const nxyValue = ['https://nxy.nwafu.edu.cn/xytz/tzgg_xwzx/', 'div.sort_rightcont ul li', 'li a', 'div.sort_rightcont2', '西北农林科技大学农业科学院通知公告'];
const cmeeValue = ['https://cmee.nwafu.edu.cn/xwzx/xytz/', 'div.sort_rightcont ul li', 'li a', 'div.sort_rightcont2', '西北农林科技大学机械与电子工程学院通知公告'];
const xshdValue = ['https://www.nwafu.edu.cn/xshd/', 'ul.subArticleList li', 'li a', '.article', '西北农林科技大学学术活动'];
const smValue = ['https://sm.nwafu.edu.cn/tzgg/', 'ul.leading-12 li', 'li a', 'article', '西北农林科技大学生命科学学院通知公告'];
const forbiddenList = ['kjtg.nwafu.edu.cn', 'kjtg.nwsuaf.edu.cn', 'fwoa.nwafu.edu.cn', 'fwoa.nwsuaf.edu.cn', 'cg.nwafu.edu.cn', 'cg.nwsuaf.edu.cn'];

const nwafuMap = new Map([
    ['lib', libValue],
    ['youth', youthValue],
    ['cie', cieValue],
    ['gs', gsValue],
    ['jcc', jccValue],
    ['jiaowu', jiaowuValue],
    ['news', newsValue],
    ['nic', nicValue],
    ['yjshy', yjshyValue],
    ['nxy', nxyValue],
    ['cmee', cmeeValue],
    ['xshd', xshdValue],
    ['sm', smValue],
    ['forbiddenList', forbiddenList],
]);

export { nwafuMap };
