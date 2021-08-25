# FAQs

**Q: What is RSS? How is RSS used? Can you recommend a useful RSS reader? **

**A:** [I have special RSS usage skills](https://diygod.me/ohmyrss/)

**Q: How does RSSHub work？**

**A:** When a request is received, RSSHub fetches the corresponding data from the original site, the resulting contents will be outputted in RSS format. Caching is implemented to avoid requesting original sites for content. And of course, we throw in a little magic 🎩.

**Q: How does RSSHub Radar work? **

**A:** When entering a new page, RSSHub Radar first according to the page link tag [Find](https://github.com/DIYgod/RSSHub-Radar/blob/master/src/js/content/utils.js# L25) The page comes with RSS, and then according to the remote update [rules](https://github.com/DIYgod/RSSHub/blob/master/assets/radar-rules.js) to find the RSSHub route applicable to the current page and the current website ; Add a little more magic.

**Q: Can I use the demo instance？**

**A:** [rsshub.app](https://rsshub.app) is the demo instance provided, running the latest build of RSSHub from master branch, the cache is set 20 minutes and it's free to use. However, if you see an badge <Badge text="strict anti-crawler policy" vertical="middle" type="warn"/> for route, this means popular websites such as Facebook etc. may pose a request quota on individual IP address, which means it can get unreliable from time to time for the demo instance. You are encouraged to [host your own RSSHub instance](/en/install/) to get a better usability.

**Q: Why are images not loading in some RSSHub routes？**

**A:** RSSHub fetches and respects the original image URLs from original sites, `referrerpolicy="no-referrer"` attribute is added to all images to solve the issues caused by cross-domain requests. Third party RSS service providers such as Feedly and Inoreader, strip this attribute off which leads to cross-domain requests being blocked.

**Q: The website I want is not supported QAQ**

**A:** If you are a JavaScript developer, please follow [this guide](/en/joinus/quick-start.html) for submitting a pull request, otherwise, follow the issue template to [submit a new issue](https://github.com/DIYgod/RSSHub/issues/new?template=rss_request_en.md), and patiently wait for Santa Claus. For priority responses, consider [sponsoring us](/en/support).

**Q: Where do I get the changelog for RSSHub？**

**A:** Subscribe our RSS here: [RSSHub added a new route](/en/program-update.html#rsshub).
