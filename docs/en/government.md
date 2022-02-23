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

## Hong Kong Centre for Health Protection

### Category

<RouteEn author="nczitzk" example="/chp" path="/chp/:category?/:language?" :paramsDesc="['Category, see below, Important Topics by default', 'Language, see below, zh_tw by default']">

Category

| Important Topics | Press Releases   | Response Level | Periodicals & Publications | Health Notice |
| ---------------- | ---------------- | -------------- | -------------------------- | ------------- |
| important_ft     | press_data_index | ResponseLevel  | publication                | HealthAlert   |

Language

| English | 中文简体 | 中文繁體 |
| ------- | -------- | -------- |
| en      | zh_cn    | zh_tw    |

</RouteEn>

## Hong Kong Department of Health

### Press Release

<RouteEn author="nczitzk" example="/hongkong/dh" path="/hongkong/dh/:language?" :paramsDesc="['Language, see below, tc_chi by default']">

Language

| English | 中文简体 | 中文繁體 |
| ------- | -------- | -------- |
| english | chs | tc_chi |

</RouteEn>

## Hong Kong Independent Commission Against Corruption

### Press Releases

<RouteEn author="linbuxiao" example="/icac/news/sc" path="/icac/news/:lang?" :paramsDesc="['Language, default to `sc`. Supprot `en`(English), `sc`(Simplified Chinese) and `tc`(Traditional Chinese)']"/>

## Macau Independent Commission Against Corruption

### Latest News

<RouteEn author="linbuxiao" example="/ccac/news/all" path="/ccac/news/:type/:lang?" :paramsDesc="['Category', 'Language, default to `sc`. Supprot `en`(English), `sc`(Simplified Chinese), `tc`(Traditional Chinese) and `pt`(Portuguese)']">
Category

| All  | Detected Cases | Investigation Reports or Recommendations  | Annual Reports | CCAC's Updates |
| ---- | -------------- | ----------------------------------------- | -------------- | -------------- |
| all  | case           | Persuasion                                | AnnualReport   | PCANews        |

</RouteEn>

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

## The White House

### Briefing Room

<RouteEn author="nczitzk" example="/whitehouse/briefing-room" path="/whitehouse/briefing-room/:category?" :paramsDesc="['Category, see below, all by default']">

| All | Blog | Legislation | Presidential Actions | Press Briefings | Speeches and Remarks | Statements and Releases |
| - | - | - | - | - | - | - |
| | blog | legislation | presidential-actions | press-briefings | speeches-remarks | statements-releases |

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

## World Health Organization | WHO

### News

<RouteEn author="nczitzk" example="/who/news" path="/who/news/:language?" :paramsDesc="['Language, see below, English by default']">

Language

| English | العربية | 中文 | Français | Русский | Español | Português |
| ------- | ------- | ---- | -------- | ------- | ------- | --------- |
| en      | ar      | zh   | fr       | ru      | es      | pt        |

</RouteEn>

### Newsroom

<RouteEn author="LogicJake nczitzk" example="/who/news-room/feature-stories" path="/who/news-room/:category?/:language?" :paramsDesc="['Category, see below, Feature stories by default', 'Language, see below, English by default']">

Category

| Feature stories | Commentaries |
| --------------- | ------------ |
| feature-stories | commentaries |

Language

| English | العربية | 中文 | Français | Русский | Español | Português |
| ------- | ------- | ---- | -------- | ------- | ------- | --------- |
| en      | ar      | zh   | fr       | ru      | es      | pt        |

</RouteEn>

### Speeches

<RouteEn author="nczitzk" example="/who/speeches" path="/who/speeches/:language?" :paramsDesc="['Language, see below, English by default']">

Language

| English | العربية | 中文 | Français | Русский | Español | Português |
| ------- | ------- | ---- | -------- | ------- | ------- | --------- |
| en      | ar      | zh   | fr       | ru      | es      | pt        |

</RouteEn>

## World Trade Organization

### Dispute settlement news

<RouteEn author="nczitzk" example="/wto/dispute-settlement" path="/wto/dispute-settlement/:year?" :paramsDesc="['Year, current year by default']"/>
