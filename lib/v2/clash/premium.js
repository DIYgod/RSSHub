const got = require("@/utils/got");

module.exports = async (ctx) => {
  const kw = ctx.params.kw;
  const order = ctx.params.order || "pubdate";
  const disableEmbed = ctx.params.disableEmbed;
  const kw_url = encodeURIComponent(kw);
  const tids = ctx.params.tid ?? 0;

  const response = await got({
    method: "get",
    url: "https://api.github.com/repos/Dreamacro/clash/releases/tags/premium",
  });
  const data = response.data;

  ctx.state.data = {
    title: "Clash Premium Releases",
    link: "https://github.com/Dreamacro/clash/releases/tag/premium",
    description: "Clash Premium Releases",
    item: [
      {
        title: data.name,
        author: data.author.login,
        description: data.body.replaceAll("\r\n","<br>"),
        pubDate: new Date(data.assets[0].updated_at),
        link: "https://github.com/Dreamacro/clash/releases/tag/premium",
      },
    ],
  };
};
