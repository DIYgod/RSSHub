# About

<p align="center" class="logo-img">
    <img src="/logo.png" alt="RSSHub" width="100">
</p>
<h1 align="center" class="logo-text">RSSHub</h1>

> 🍰 Everything is RSSible

[![telegram](https://img.shields.io/badge/chat-telegram-brightgreen.svg?style=flat-square)](https://t.me/rsshub)
[![build status](https://img.shields.io/travis/DIYgod/RSSHub/master.svg?style=flat-square)](https://travis-ci.org/DIYgod/RSSHub)
[![Test coverage](https://img.shields.io/codecov/c/github/DIYgod/RSSHub.svg?style=flat-square)](https://codecov.io/github/DIYgod/RSSHub?branch=master)

RSSHub is a lightweight and extensible RSS feed aggregator, it's able to generate feeds from pretty much everything.

## Special Thanks

### Special Sponsors

<a href="https://rixcloud.app/rsshub" target="_blank"><img height="60px" src="https://i.imgur.com/TrgP3S1.png"></a><a href="https://apps.apple.com/cn/app/%E5%BF%AB%E7%9F%A5-%E8%AE%A9%E4%BF%A1%E6%81%AF%E8%8E%B7%E5%8F%96%E6%9B%B4%E9%AB%98%E6%95%88/id1465578855" target="_blank" style="margin-left: 10px;"><img height="60px" src="https://i.imgur.com/YjqwaKE.png"></a><a href="https://partner.lizhi.io/rsshub/office_365_share" target="_blank" style="margin-left: 10px;"><img height="60px" src="https://i.imgur.com/GyYi9MI.png"></a>

### Sponsors

| [Liuyang](https://github.com/lingllting) | [Sayori Studio](https://t.me/SayoriStudio) | Anonymous | [Sion Kazama](https://blog.sion.moe) | [琚致远](https://www.shaoyaoju.org/) |
| :--------------------------------------: | :----------------------------------------: | :-------: | :----------------------------------: | :----------------------------------: |


[![](https://opencollective.com/static/images/become_sponsor.svg)](/support/)

### Contributors

[![](https://opencollective.com/RSSHub/contributors.svg?width=740)](https://github.com/DIYgod/RSSHub/graphs/contributors)

Logo designed by [sheldonrrr](https://dribbble.com/sheldonrrr)

## FAQs

**Q: How does RSSHub work？**

**A:** When a request is received, RSSHub fetches the corresponding data from the original site, the result ing contents will be output in RSS format. Caching is implemented to avoid requesting original sites for content. And of course, we throw in a little magic 🎩.

**Q: Can I use the demo instance？**

**A:** [rsshub.app](https://rsshub.app) is the demo instance provided, running the latest build of RSSHub from master branch, the cache is set 20 minutes and it's free to use. However, popular websites such as Instagram and YouTube etc. may pose a request quota on individual IP address, which means it can get unreliable from time to time for the demo instance. You are encouraged to [host your own RSSHub instance](/en/install/) for a better usability.

**Q: Why are images not loading in some RSSHub routes？**

**A:** RSSHub fetches and respects the original image URLs from original sites, `referrerpolicy="no-referrer"` attribute is added to all images to solve the issues caused by cross-domain requests. Third party RSS service providers such as Feedly and Inoreader, strip this attribute off which leads to cross-domain requests being blocked.

**Q: The website I want is not supported QAQ**

**A:** If you are a JavaScript developer, please follow [this guide](/joinus) for submitting a pull request, otherwise, follow the issue template to [submit a new issue](https://github.com/DIYgod/RSSHub/issues/new?template=rss_request_en.md), and patiently wait for Santa Claus. For priority responses, consider [sponsoring us](/support).

**Q: Where do I get the changelog for RSSHub？**

**A:** Subscribe our RSS here: [RSSHub added a new route](/en/program-update.html#rsshub).
