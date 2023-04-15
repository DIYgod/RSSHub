# FAQs

**Q: How does RSSHub work？**

**A:** When a request is received, RSSHub fetches the corresponding data from the original site, the resulting contents will be outputted in RSS format. Caching is implemented to avoid requesting original sites for content. And of course, we throw in a little magic 🎩.

**Q: Can I use the demo instance？**

**A:** [rsshub.app](https://rsshub.app) is the demo instance provided, running the latest build of RSSHub from master branch, the cache is set 120 minutes and it's free to use. However, if you see an badge <Badge text="strict anti-crawler policy" vertical="middle" type="warn"/> for route, this means popular websites such as Facebook etc. may pose a request quota on individual IP address, which means it can get unreliable from time to time for the demo instance. You are encouraged to [host your own RSSHub instance](/en/install/) to get a better usability.

**Q: Why are images/videos not loading in some RSSHub routes？**

**A:** RSSHub fetches and respects the original image/video URLs from original sites, in which some are behind anti-hotlink filters. `referrerpolicy="no-referrer"` attribute is added to all images to solve the issues caused by cross-domain requests. Third party RSS service providers such as Feedly and Inoreader, strip this attribute off, resulting in cross-domain requests being blocked. Meanwhile, the attribute is not available for videos yet, resulting in most RSS readers unable to pass the anti-hotlink check. Here are some workarounds:

1.  Migrate to RSS readers that do not send Referer，such as [Inoreader for Web](https://www.inoreader.com/) with a [user script disabling Referer](https://greasyfork.org/en/scripts/376884), [fix-image-error at inoreader](https://greasyfork.org/scripts/463461-fix-image-error-at-inoreader), [RSS to Telegram Bot](https://github.com/Rongronggg9/RSS-to-Telegram-Bot), etc. If your RSS reader can bypass the anti-hotlink check successfully and play embedded videos, it's an RSS reader that do not send Referer. Please consider adding it to the documentation to help more people.
2.  Set up a reverse proxy, refer to [Parameters->Multimedia processing](/en/parameter.html#multimedia-processing) for more details.
3.  Navigate back to the original site.

**Q: The website I want is not supported QAQ**

**A:** If you are a JavaScript developer, please follow [this guide](/en/joinus/quick-start.html) for submitting a pull request, otherwise, follow the issue template to [submit a new issue](https://github.com/DIYgod/RSSHub/issues/new?template=rss_request_en.md), and patiently wait for Santa Claus. For priority responses, consider [sponsoring us](/en/support).

**Q: Where do I get the changelog for RSSHub？**

**A:** Subscribe our RSS here: [RSSHub added a new route](/en/program-update.html#rsshub).
