## Please refer to [Join Us](https://docs.rsshub.app/joinus/)

Self-hosted instances can set `REQUEST_RATE_LIMITS='{"www.zhihu.com":{"points":1,"duration":5}}'` to space outgoing requests to specific hostnames. `duration` is measured in seconds; `points` is a positive integer. Matching is exact, so configure API subdomains separately. Limits apply per process or Worker isolate, including proxy requests; multiple replicas need an external shared limiter for a combined limit. Other websites retain their existing behavior.
