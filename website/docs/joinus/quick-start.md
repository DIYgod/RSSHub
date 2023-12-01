---
sidebar_position: 1
---

# Quick Start

If you've found a bug or have a suggestion for improving RSSHub, we'd love to hear from you! You can submit your changes by creating a pull request. Don't worry if you're new to pull requests - we welcome contributions from developers of all experience levels. Don't know how to code? You can also help by [reporting bugs](https://github.com/DIYgod/RSSHub/issues).

## Join the discussion

[![Telegram Group](https://img.shields.io/badge/chat-telegram-brightgreen.svg?logo=telegram&style=for-the-badge)](https://t.me/rsshub) [![GitHub issues](https://img.shields.io/github/issues/DIYgod/RSSHub?color=bright-green&logo=github&style=for-the-badge)](https://github.com/DIYgod/RSSHub/issues) [![GitHub Discussions](https://img.shields.io/github/discussions/DIYgod/RSSHub?logo=github&style=for-the-badge)](https://github.com/DIYgod/RSSHub/discussions)

## Before you begin

To create an RSS feed, you'll need to use a combination of Git, HTML, JavaScript, jQuery, and Node.js.

If you don't know much about them but would like to learn them, here are some good resources:

-   [JavaScript Tutorials on MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript#tutorials)
-   [W3Schools](https://www.w3schools.com/)
-   [Git course on Codecademy](https://www.codecademy.com/learn/learn-git)

If you'd like to see examples of how other developers use these technologies to create RSS feeds, you can take a look at some of the code in [our repository](https://github.com/DIYgod/RSSHub/tree/master/lib/v2).

## Submit new RSSHub rules

If you've found a website that doesn't offer an RSS feed, you can create an RSS rule for it using RSSHub. An RSS rule is a short Node.js program code (hereafter referred to as "route") that tells RSSHub how to extract content from a website and generate an RSS feed. By creating a new RSS route, you can help make content from your favourite websites more accessible and easier to follow.

Before you start writing an RSS route, please make sure that the source site does not provide RSS. Some web pages will include a link element with type `application/atom+xml` or `application/rss+xml` in the HTML header to indicate the RSS link.

Here's an example of what an RSS link might look like in the HTML header: `<link rel="alternate" type="application/rss+xml" href="http://example.com/rss.xml" />`. If you see a link like this, it means that the website already has an RSS feed and you don't need to create a new RSS route for it.

### Getting started

In this guide, you'll learn how to create a new RSS route from scratch. We'll cover everything from setting up your development environment to submitting your code to the RSSHub repository. By the end of this guide, you'll be able to create your own RSS feeds for websites that don't offer them.

[Ready to get started? Click here to dive into the guide!](/joinus/new-rss/prerequisites)

## Submit new RSSHub Radar rules

### Before you start

It's recommended that you download and install RSSHub Radar in your browser before you start.

Once you have installed RSSHub Radar, open the settings and switch to the "List of rules" tab. Then scroll down to the bottom of the page and you will see a text field. Here, you can replace the old rules with your new rules for debugging.

[Let's start!](/joinus/new-radar)

<Link to="https://chrome.google.com/webstore/detail/rsshub-radar/kefjpfngnndepjbopdmoebkipbgkggaa" target="_blank" rel="noopener noreferrer"><img src="https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/UV4C4ybeBTsZt43U4xis.png" alt="Get RSSHub Radar for Chromium" style={{height: "58px"}} /></Link>
<Link to="https://addons.mozilla.org/firefox/addon/rsshub-radar/" target="_blank" rel="noopener noreferrer"><img src="https://blog.mozilla.org/addons/files/2020/04/get-the-addon-fx-apr-2020.svg" alt="Get Get RSSHub Radar for Firefox" style={{height: "58px"}} /></Link>
<Link to="https://microsoftedge.microsoft.com/addons/detail/rsshub-radar/gangkeiaobmjcjokiofpkfpcobpbmnln" target="_blank" rel="noopener noreferrer"><img src="https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/f/f7/Get_it_from_Microsoft_Badge.svg" alt="Get RSSHub Radar for Edge" style={{height: "58px"}} /></Link>
<Link to="https://apps.apple.com/us/app/rsshub-radar/id1610744717" target="_blank" rel="noopener noreferrer"><img src="https://developer.apple.com/news/images/download-on-the-app-store-badge.png" alt="Get RSSHub Radar for Safari" style={{height: "58px"}} /></Link>
