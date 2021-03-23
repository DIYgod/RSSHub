---
pageClass: routes
---

# Goverment

## Central Intelligence Agency

### Annual FOIA Reports

<RouteEn author="nczitzk" example="/cia/foia-annual-report" path="/cia/foia-annual-report"/>

## Constitutional Court of Baden-Württemberg (Germany)

### Press releases

<RouteEn author="quinn-dev" example="/verfghbw/press" path="/verfghbw/press/:keyword?" :paramsDesc="['Keyword']"/>

## Ministry of Foreign Affairs of Japan

### Press conference

<RouteEn author="sgqy" example="/go.jp/mofa" path="/go.jp/mofa"/>

## Supreme Court of the United States

### Arguments Audios

<RouteEn author="nczitzk" example="/us/supremecourt/argument_audio" path="/us/supremecourt/argument_audio/:year?" :paramsDesc="['Year, current year by default']"/>

## The United States Trade Representative

### Press Releases

<RouteEn author="nczitzk" example="/ustr/press-releases" path="/ustr/press-releases/:year?/:month?" :paramsDesc="['Year, current year by default', 'Month, empty by default, show contents in all year']">

::: tip Tip

Fill in the English expression for the month in the Month field, eg `December` for the 12th Month。

:::

</RouteEn>

## U.S. Department of the Treasury

### Press Releases

<RouteEn author="nczitzk" example="/treasury/press-releases" path="/treasury/press-releases/:category?/:title?" :paramsDesc="['Category, see below, all by default', 'Title keywords, empty by default']">

Category

| Press Releases | Statements & Remarks | Readouts | Testimonies |
| -------------- | -------------------- | -------- | ----------- |
| all            | statements-remarks   | readouts | testimonies |

</RouteEn>

## United Nations

### Security Council Vetoed a Resolution

<RouteEn author="HenryQW" example="/un/scveto" path="/un/scveto"/>

## World Trade Organization

### Dispute settlement news

<RouteEn author="nczitzk" example="/wto/dispute-settlement" path="/wto/dispute-settlement/:year?" :paramsDesc="['Year, current year by default']"/>
