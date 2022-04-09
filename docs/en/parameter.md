# Parameters

::: tip

The parameters can be linked with `&` to used together to generate a complex feed.

:::

## Filtering

The following URL query parameters are supported, Regex support is built-in.

Set `filter` to include the content

-   `filter`: filter `title` and description

-   `filter_title`: filter `title` only

-   `filter_description`: filter `description` only

-   `filter_author`: filter `author` only

-   `filter_time`: filter `pubDate`, in seconds, return specified time range. Item without `pubDate` will not be filtered.

For example: [https://rsshub.app/dribbble/popular?filter=Blue|Yellow|Black](https://rsshub.app/dribbble/popular?filter=Blue|Yellow|Black)

Set `filterout` to exclude unwanted content.

-   `filterout`: filter `title` and description

-   `filterout_title`: filter `title` only

-   `filterout_description`: filter `description` only

-   `filterout_author`: filter `author` only

For example: [https://rsshub.app/dribbble/popular?filterout=Blue|Yellow|Black](https://rsshub.app/dribbble/popular?filterout=Blue|Yellow|Black)

Set `filter_case_sensitive` to determine whether the filtering keywords should be case sensitive. The parameter would apply to both `filter` and `filterout`.

Default: `true`

Example: [https://rsshub.app/dribbble/popular?filter=BluE|yeLLow|BlaCK&filter_case_sensitive=false](https://rsshub.app/dribbble/popular?filter=BluE|yeLLow|BlaCK&filter_case_sensitive=false)

## Limit Entries

Set `limit` to limit the number of articles in the feed.

E.g. Dribbble Popular Top 10 [https://rsshub.app/dribbble/popular?limit=10](https://rsshub.app/dribbble/popular?limit=10)

## Fulltext

Enable fulltext via `mode` parameter.

E.g. Bilibili article <https://rsshub.app/bilibili/user/article/334958638?mode=fulltext>

## Access Control

Set `key` or `code` to grant access to requests. See [Access Control Configuration](install/#configuration-access-control-configuration-access-key-code).

## Telegram Instant View

Replace website link with Telegram's Instant View link.

Enable Telegram Instant View requires a page template, it can be obtained from Telegram's [Instant View page](https://instantview.telegram.org/)

-   `tgiv`: template hash, obtained from the link of template page generated（the string after `&rhash=`）

E.g. <https://rsshub.app/novel/biquge/94_94525?tgiv=bd3c42818a7f7e>

## Sci-hub link

Output Sci-hub link in scientific journal routes, this supports major journals or routes that output DOIs.

-   `scihub`: set to any value

E.g. <https://rsshub.app/pnas/latest?scihub=1>

## Conversion between Traditional and Simplified Chinese

-   `opencc`: `s2t` (Simplified Chinese to Traditional Chinese)、`t2s` (Traditional Chinese to Simplified Chinese), other optional values refer to [simplecc-wasm - Configurations](https://github.com/fengkx/simplecc-wasm#%E9%85%8D%E7%BD%AE-configurations)

E.g. <https://rsshub.app/dcard/posts/popular?opencc=t2s>

## Output Formats

RSSHub conforms to RSS 2.0 and Atom Standard, simply append `.rss` `.atom` to the end of the feed address to obtain the feed in corresponding format. The default output format is RSS 2.0.

For example:

-   Default (RSS 2.0) - [https://rsshub.app/dribbble/popular](https://rsshub.app/dribbble/popular)
-   RSS 2.0 - [https://rsshub.app/dribbble/popular.rss](https://rsshub.app/dribbble/popular.rss)
-   Atom - [https://rsshub.app/dribbble/popular.atom](https://rsshub.app/dribbble/popular.atom)
-   Apply filters or URL query [https://rsshub.app/dribbble/popular.atom?filterout=Blue|Yellow|Black](https://rsshub.app/dribbble/popular.atom?filterout=Blue|Yellow|Black)
