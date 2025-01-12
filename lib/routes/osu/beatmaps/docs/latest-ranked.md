Subscribe to the new beatmaps on https://osu.ppy.sh/beatmapsets.

### Parameter Description

Parameters allows you to:

- Filter game mode
- Limit beatmap difficulty
- Show/hide game mode in feed title

Below is a table of all allowed parameters passed to `routeParams`

| Name              | Default  | Description                                                                                                                                                                                                                                            |
| ----------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `includeMode`     | All mode | Could be `osu`, `mania`, `fruits` or `taiko`. Specify included game mode of beatmaps. Including this paramseter multiple times to specify multiple game modes, e.g.: `includeMode=osu&includeMode=mania`. Subscribe to all game modes if not specified |
| `difficultyLimit` | None     | Lower/upper limit of star rating of the beatmaps in the beatmapset item, e.g.:`difficultyLimit=U6`. Checkout tips in descriptions for detailed explaination and examples.                                                                              |
| `modeInTitle`     | `true`   | `true` or `false` Add mode info into feed title.                                                                                                                                                                                                       |

This actual parameters should be passed as `routeParams` in URL Query String format without `?`, e.g.:

    /osu/latest-ranked/modeInTitle=true&includeMode=osu

:::tip
You could make use of `difficultyLimit` paramters to create a "high difficulty/low difficulty only" only feed.

For example, if you only wants to play low star rating beatmap like 1 or 2 star, you could subscribe to:

    /osu/latest-ranked/difficultyLimit=U2

This will filter out all beatmapsets that do not provide at least one beatmap with sta`r rating<=`2.00`.

Similarly, you could use lower bound to filter out beatmapsets which don't have at least one beatmap
with star rating higher than a certain threshold.

    /osu/latest-ranked/difficultyLimit=L6

Now all beatmapsets that don't provided at least one beatmap with star rating higher than `6.00` will be filtered.
:::
