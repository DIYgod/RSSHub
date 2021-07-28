---
pageClass: routes
---

# Travel

## All the Flight Deals

### Flight Deals

<RouteEn author="HenryQW" path="/atfd/:locations/:nearby?" example="/atfd/us+new%20york,gb+london/1" :paramsDesc="['the departing city, consists of an 「ISO 3166-1 country code」 and a 「city name」.  Origin\'s ISO 3166-1 country code + city name, eg. `us+new york`, [https://rsshub.app/atfd/us+new york](https://rsshub.app/atfd/us+new%20york). Multiple origins are supported via a comma separated string, eg. `us+new york,gb+london`, [https://rsshub.app/atfd/us+new york,gb+london/](https://rsshub.app/atfd/us+new%20york,gb+london/).', 'whether includes nearby airports, optional value of 0 or 1, default to 0 (exclude nearby airports)']" >

For ISO 3166-1 country codes please refer to [Wikipedia ISO_3166-1](https://en.wikipedia.org/wiki/ISO_3166-1)

::: tip

If the city name contains a space like `Mexico City`, replace the space with `%20`, `Mexico%20City`.

:::

</RouteEn>

## Hopper

### Flight Deals

<RouteEn author="HenryQW" path="/hopper/:lowestOnly/:from/:to?" example="/hopper/1/LHR/PEK" :paramsDesc="['set to `1` will return the cheapest deal only, instead of all deals, so you don\'t get spammed', 'origin airport IATA code', 'destination airport IATA code, if unset the destination will be set to `anywhere`']" >

This route returns a list of flight deals (in most cases, 6 flight deals) for a period defined by Hopper's algorithm, which means the travel date will be totally random (could be tomorrow or 10 months from now).

For airport IATA code please refer to [Wikipedia List of airports by IATA code](https://en.wikipedia.org/wiki/List_of_airports_by_IATA_code:_A)

</RouteEn>
