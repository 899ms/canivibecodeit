_Published alongside the study "can you vibecode ahrefs?". Unedited apart from removing server paths, hostnames and port numbers for publication. Where this file compares the clone against "193" referring domains, that was Ahrefs' count for canivibecodeit.com on 7 August 2026; the study itself uses the count on Rob's screen on 9 September 2026, 346._

# Can you vibecode Ahrefs? — one-shot clone attempt ("vibehrefs"), REPORT

Attempt run by an executor agent from the verbatim prompt in `clone-brief.md`, inside a 6-hour box, on a 4-core / 7.6 GB / 150 GB Linux box with a data-centre IP. The app is **vibehrefs**, at `the project folder` (local git, 3 commits, no remote), running under **the process manager as `vibehrefs` on `the local dashboard`**. Study notes stay in `the project folder`: this report, `LOG.md` (timestamped as it happened), `shots/` (feature and wall screenshots), `reference/` (Ahrefs screens used as design reference, with source URLs), `probes/` (raw source probes). Addenda 1 and 2 to the brief are applied; §8 lists each point.

## 1. Timeline

| | |
|---|---|
| Start | 2026-09-07 **17:56 UTC** (box closes 23:56) |
| Build complete, all three features tested on the required inputs | 18:27 UTC |
| First report written | 18:37 UTC |
| Addenda applied (rename to vibehrefs, move, the process manager, Ahrefs-style UI, wall screenshots, git) | 18:39–18:46 UTC |
| Common Crawl index back; 2 linking pages recovered; final report | 18:44–18:50 UTC |
| **Wall-clock used** | **about 55 minutes** of the 6 hours (the remaining time would not have changed the result — see §4: what is missing is data, not code) |
| Turns / tokens | ~75 tool calls; roughly 220k tokens of context consumed according to the session's budget counter (not a billing figure) |

Key moments (full detail in `LOG.md`): 17:56 brief read → 17:59 every candidate source probed → 17:59–18:04 Common Crawl domain graph downloaded (12.7 GB at ~17 MB/s) → 18:05–18:09 first in-link scan of 2.45 billion arcs (4.5 min) → 18:07–18:10 keyword explorer and rank tracker tested → 18:12–18:27 both backlink scans run through the dashboard → 18:12–18:32 screenshots.

## 2. What got built

A Python 3.12 / Flask / SQLite app, one dashboard on `the local dashboard` (the process manager process `vibehrefs`), three reports laid out after Ahrefs' own Site Explorer, Keywords Explorer and Rank Tracker screens (overview metric cards, report tables, position history; references in `reference/SOURCES.md`). Every Ahrefs metric the free data cannot produce is printed in red as **not available** in its usual place — DR, Backlinks, Organic keywords/traffic, Volume, CPC, Traffic potential, Share of Voice — so the screenshots show the shape of Ahrefs with the holes visible. It runs. The first, generic-looking version of the UI is kept as `shots/*-v1-generic-ui.png`.

**Backlink checker** (`shots/clone-backlinks.png`, full page `clone-backlinks-full.png`, extra `extra-backlinks-ahrefs-com.png`). Type a domain → the app streams the Common Crawl domain-level web graph and lists every domain with an arc to yours, ranked by the referring domain's Common Crawl harmonic-centrality position; for the top 40 it fetches the homepage live to find a sample linking page and, if the link is on it, asks the Wayback Machine for the earliest capture (first seen); a fallback searches the Common Crawl page index for an actual linking page. Also lists Hacker News and Wikipedia mentions. **canivibecodeit.com: 5 referring domains** (alobbs.com, mattiarighetti.net, microsaasexamples.com, superx.so, zoer.ai), 1 HN mention, 0 Wikipedia; **2 actual linking pages with dates** recovered from Common Crawl page captures once its index server came back (microsaasexamples.com/p/can-i-vibecode-it, crawled 2026-08-19, Wayback first capture 2026-08-22; mattiarighetti.net/just-because-you-can-it-doesnt-mean-you-should/, crawled 2026-08-15, never archived by Wayback), 3 without. **ahrefs.com: 116,776 referring domains**, top ones google.com, linkedin.com, cloudflare.com, wikipedia.org, wordpress.org, github.com; 141 HN/Wikipedia mentions. Page-level backlink count: shown as "not available" (the graph has no pages).

**Keyword explorer** (`shots/clone-keywords.png`, full page `clone-keywords-full.png`). Type a keyword (US) → related ideas from Google + DuckDuckGo autocomplete (seed + a–z + question prefixes), a 12-month Google Trends interest chart, a 0–100 "difficulty proxy" computed from the Common Crawl authority of the Bing top-10 domains, and a **"Monthly search volume: not available"** tile in red. Results: "vibe coding" 328 ideas, Trends 12-mo avg 50.4 (peak week 100 = w/c 23 Aug 2026), difficulty 43; "notion alternatives" 210 ideas, Trends avg 44.6, difficulty 51; "granola pricing" 73 ideas, Trends avg 37.1, difficulty 25.

**Rank tracker** (`shots/clone-ranktracker.png`, full page `clone-ranktracker-full.png`, first check `clone-ranktracker-firstcheck.png`). Keyword list per domain, "check now" button, in-process daily run at 06:00 UTC plus a `track.py` cron entry, per-keyword history strip, top-10 stored per check. Engine is **Bing** (see §3). Two checks run (18:09 and 18:13 UTC; the second was triggered by hand so the history strip has two points — a daily cadence was not observed within the box). **canivibecodeit.com is not in Bing's top 10 for any of the 10 keywords**, including "can i vibecode it", for which Bing returned canva.com and five dictionary entries for the word "can" (`shots/extra-bing-serp-can-i-vibecode-it.png`).

## 3. Where the data came from

### Backlink checker
| Source | Tried | Result |
|---|---|---|
| **Common Crawl web graph `cc-main-2026-jun-jul-aug`, domain level** (`data.commoncrawl.org/projects/hyperlinkgraph/…/domain/`): vertices 0.89 GB, edges 9.43 GB, ranks 2.36 GB; 119,722,885 domains, 2,450,405,793 arcs | yes | **Worked.** canivibecodeit.com = vertex 24457970 (1 host). In-links found: **5**. ahrefs.com (vertex 15154848) **116,776**; also scanned in the same pass: notion.so 51,150, notion.com 16,867, granola.ai 1,675. One scan = zcat+grep over the whole edges file, 4.5–5.5 min. |
| Common Crawl domain ranks (same edition), top 1,000,000 loaded into SQLite | yes | Worked. ahrefs.com harmonic rank 456, notion.so 964, granola.ai 13,789, **canivibecodeit.com 39,005,813** (outside top 1M → shown blank). Only 8,282 of ahrefs.com's 116,776 referring domains are inside the top 1M. |
| Common Crawl page index (`index.commoncrawl.org`, CC-MAIN-2026-34/-30/-25) + WARC range fetches, to find an actual linking page | yes | **Partly.** Standalone test at 18:15: `microsaasexamples.com/*` → 25 records → found **https://www.microsaasexamples.com/p/can-i-vibecode-it** linking to canivibecodeit.com, crawled 2026-08-19 (3.4 s); `zoer.ai/*` → no linking page in 25 records. From 18:18 the index server refused all connections from this IP (HTTP 000; down until ~18:44, 26 minutes), so inside the app the fallback checked 2 of 5 domains (alobbs.com, zoer.ai: no page found) and could not check the other 3. At 18:44 it answered again and the same code found **2 linking pages**: microsaasexamples.com/p/can-i-vibecode-it (CC-MAIN-2026-34, crawled 2026-08-19) and mattiarighetti.net/just-because-you-can-it-doesnt-mean-you-should/ (crawled 2026-08-15); superx.so: none in 15 pages. For ahrefs.com the fallback was not re-run (0 of 10 checked while the server was down). |
| Live homepage fetch of each referring domain (top 40) | yes | Worked as a fetch; the link was on **0 of 5** homepages for canivibecodeit.com and **0 of 38** reachable homepages for ahrefs.com (links live on inner pages, which this method does not visit). |
| Wayback Machine CDX (first-seen date) | yes | API works (canivibecodeit.com's own first capture: 2026-07-30). Invoked on the 2 recovered linking pages: microsaasexamples page first archived 2026-08-22 (later than Common Crawl's 2026-08-19 capture, so the earlier date is shown); the mattiarighetti page has never been archived → its only date is the crawl date. **2 first-seen dates delivered, both "earliest capture we know of", not true first-seen.** |
| Hacker News Algolia API (`hn.algolia.com/api/v1/search?query=canivibecodeit.com`) | yes | 1 hit: HN submission "Can I vibe code it?" 2026-08-01 (item 49129884). ahrefs.com: 95 hits. |
| Wikipedia `list=exturlusage&euquery=canivibecodeit.com` | yes | **0** results. ahrefs.com: 46 pages. |
| Reddit search JSON (`reddit.com/search.json`, `old.reddit.com`) | yes | HTML "Blocked" page. Not used. |
| Bing `"canivibecodeit.com" -site:canivibecodeit.com` and `site:canivibecodeit.com` | yes | Garbage (Chinese novel sites; a farm game). Bing does not honour the operators for this client. Not used. |
| Ahrefs / Semrush / Moz / OpenPageRank / any keyed SEO API | no | Out of bounds; OpenPageRank needs an account I cannot create. |

### Keyword explorer
| Source | Tried | Result |
|---|---|---|
| Google autocomplete endpoint `suggestqueries.google.com/complete/search?client=firefox&gl=us` (33 expansions per keyword) | yes | Worked, no errors: 328 / 210 / 73 distinct ideas for the three keywords. |
| DuckDuckGo autocomplete `duckduckgo.com/ac/` | yes | Worked (8 suggestions per keyword). |
| Google Trends via pytrends, `interest_over_time`, US, 12 months | yes | Worked after dropping the urllib3 `method_whitelist` kwarg (pytrends 4.9 vs urllib3 2). 53 weekly points per keyword. `related_queries` → HTTP 429 on the first call; not used. ~1 lookup a minute is the practical ceiling. |
| Bing web results, legacy RSS output (`format=rss`) for the top 10 | yes | Returns 10–11 URLs; `count` and `first` are ignored, so no page 2. Locale not honoured: "granola pricing" top-10 has 6 Dutch recipe sites. |
| Any monthly-volume source (Keyword Planner, DataForSEO, Semrush, keywordtool…) | no | All need an Ads account or a paid key. **No free volume source exists. The tile says "not available".** |

### Rank tracker
| Source | Tried | Result |
|---|---|---|
| Google search pages | **not tried** — forbidden by the brief | — |
| DuckDuckGo (`html.duckduckgo.com`, `lite.duckduckgo.com`), curl and headless Chromium | yes | "Unfortunately, bots use DuckDuckGo too" picture CAPTCHA every time (`shots/extra-ddg-captcha.png`). Not solved on principle; a daily tool cannot rely on it. |
| Brave Search HTML | yes | CAPTCHA page. |
| Mojeek HTML | yes | CAPTCHA page. |
| Qwant API | yes | DataDome JS challenge. |
| Yandex HTML | yes | Empty 0-byte response. |
| Startpage / SearXNG (Google by proxy) | no | Decided against: they are Google SERPs by another door. |
| **Bing HTML** (`li.b_algo`, click-redirect URLs base64-decoded), with browser user-agent, 2 s apart; identical results via curl, headless Chromium typing into the homepage, and RSS | yes | **Works, but degraded**: top 10 only; "can i vibecode it" → results for the word "can"; "notion alternatives" → ten notion.com pages; locale drifts. 20 checks stored, 0 errors. |

## 4. Where it hit the wall

**Backlink checker.** The public wall is the size and cadence of the only free link graph. Common Crawl's Jun–Aug 2026 graph gives **5 referring domains for canivibecodeit.com; Ahrefs showed 193 on 7 Aug** (operator's pull), i.e. the free index sees about **2.6%** of what Ahrefs sees for a two-month-old site — and it sees domains, not pages, so "backlinks" (Ahrefs' page-level count) cannot be produced at all. The ~180-domain .shop/.click spam wave Ahrefs caught is entirely absent: Common Crawl never fetched those pages. For a big site the count is large (ahrefs.com: 116,776 referring domains) but I do not have Ahrefs' own number for ahrefs.com to set beside it, so I make no claim about the ratio there. Second wall: linking-page and first-seen. Ahrefs stores every linking URL with a first-seen date; here the graph stores none, the homepage probe found the link on 0 of 43 homepages, and the Common Crawl page index — the only way to recover a URL — refused connections after roughly 30 requests. Delivered: **2 linking pages and 2 earliest-capture dates** out of 5 referring domains, and only after waiting 26 minutes for the index server; 0 of 116,776 for ahrefs.com. Third wall: freshness — a new graph appears about every three months, so a link earned today shows up between one and four months later, if the linking page is in the crawl at all.

**Keyword explorer.** The wall is at the first number: **monthly search volume does not exist in public data**. Autocomplete yields plenty of phrases (328 for "vibe coding") but no counts; Trends gives a 0–100 index normalised to each keyword's own peak, so "granola pricing" avg 37 and "vibe coding" avg 50 are not comparable and neither is a volume (Ahrefs reports one for each, with 36-month history, clicks and CPC; I did not see those numbers and do not guess them). Difficulty: Ahrefs' KD is derived from the referring-domain counts of the Google top-10 pages. Here there are no Google results, and the Bing top-10 as served to a data-centre IP is visibly wrong ("notion alternatives" is ten notion.com pages), so the 0–100 "difficulty proxy" (average Common Crawl authority of those domains) is a defensible number computed over an indefensible SERP.

**Rank tracker.** The wall is the SERP itself: the tool cannot see Google, and no other engine will talk to a server without a CAPTCHA except Bing, which serves a degraded, locale-drifting first page of ten. Result: **0 of 10 keywords ranked** in the tool, versus whatever Ahrefs' Rank Tracker shows for the same list (the operator's A5 screenshot; I have not seen it). Even "can i vibecode it", the brand query, cannot be tracked, because Bing answers it with dictionary entries. The mechanics (storage, history, daily run, dashboard) are the easy part and they work; without a SERP source they are a clock with no hands.

## 5. What you had to fake or skip

Faked: **nothing**. No placeholder numbers anywhere; every tile is either a measured figure or the words "not available".

Skipped or degraded, all labelled in the UI and README:
- Monthly search volume — skipped (no free source). The "Trends interest" tile is Google Trends' relative 0–100 index, not a volume.
- "Difficulty proxy" — is not Ahrefs KD: it is the mean Common Crawl harmonic-centrality authority of the Bing top-10 domains; it uses no backlink counts of the ranking pages and rests on a degraded Bing SERP.
- Page-level backlink count — skipped (domain graph only). "Referring domains" is a real count from the graph.
- First-seen date — delivered for 2 of 5 referring domains, and those are "earliest capture Common Crawl or Wayback has", which is a lower bound on age, not the date the link appeared; the other 3 rows show a homepage on which the link was **not** found, and say so.
- Google rankings — skipped (forbidden). Positions are Bing top-10 as served to this IP, locale not reliable. Positions 11+ are invisible.
- "Checked daily" — implemented (in-process scheduler + cron entry) but not witnessed: the two stored checks are 4 minutes apart, the second run by hand.
- Related keywords from Trends (`related_queries`) — skipped after an immediate HTTP 429.
- The ahrefs.com referring-domain list stores the top 5,000 of 116,776 (the count is exact; the list is a sample).

## 6. The honest verdict

I would keep none of the three as an Ahrefs replacement, and only one as a tool at all. The keyword explorer's idea list is genuinely useful — 328 real autocomplete phrases for "vibe coding" in a minute, free, forever — but the moment you ask "how many people search this?" it has no answer and no honest way to get one, and its difficulty score is arithmetic over a search page that Bing serves to bots, not to people. The backlink checker is the clearest picture of the moat: a working UI on a hollow index — 5 referring domains where Ahrefs has 193, two linking pages and two capture dates out of five, a quarterly refresh, and a 12-GB download plus a 5-minute scan for every lookup. The rank tracker is the hollowest of the three: everything Ahrefs does around the SERP (storage, history, dashboard, daily run) took twenty minutes to build, and the SERP itself — the only part that matters — was not obtainable: Google is off-limits, every other engine CAPTCHA'd the server, and Bing's answer to the site's own brand query was a dictionary definition of "can". What Ahrefs sells is not the software; it is the crawler, the SERP fleet and the years of stored first-seen dates, and none of that was reachable from here in six hours or would be in six months.

## 7. Cost

- Agent time: ~55 minutes wall-clock, ~75 tool calls, ~220k context tokens (session counter). Money spent: **$0**.
- API keys used: **none**. Every source was keyless: Common Crawl (S3 public bucket + index server, rate-limited by IP), Wayback CDX, HN Algolia, Wikipedia API, Google autocomplete, DuckDuckGo autocomplete, Google Trends (unofficial, ~1 request/min before 429), Bing HTML/RSS (unofficial).
- Disk: 12.7 GB of Common Crawl graph files, refreshed about quarterly (a new 12.7 GB download each time); SQLite database 65 MB.
- Running it daily: **$0** in money. Compute: the rank check is 10 HTTP requests; a backlink lookup is ~5 minutes of one CPU core per domain. Risks that are not money: Bing or Google Trends changing or blocking unofficial access (no SLA, no key to re-issue), and the Common Crawl index server's rate limit, which stopped this run mid-way.

## 8. How to run it, and the addenda

- **Name / home:** `vibehrefs`, `the project folder` (README, app title and process-manager name all say vibehrefs; nothing named Hrefless was ever created). Not inside the site repo.
- **Process:** the process manager from the project folder → a process-manager entry named vibehrefs, bound to **the local dashboard** only (4100–4199 range; 4173 was taken). No public URL, no nginx entry. nothing else on the machine touched.
- **Manual run:** `.venv/bin/python -m clone.app` (PORT env var), daily rank check `track.py` from cron or the in-process 06:00 UTC scheduler. Full setup incl. the 12.7 GB Common Crawl download in the README.
- **Git:** local only, `git init` in the project folder, **3 commits**, no remote, no push. `.gitignore` excludes `.venv/`, `data/` (the 12.7 GB Common Crawl files + SQLite), `*.db`, `*.log`, `.env`. A grep of all tracked files for keys, tokens, passwords, IPs and the operator's hostnames returns nothing.
- **Design reference:** Ahrefs product/help/blog screens saved by the PM on 2026-09-07, copied to `the project folder/reference/` with their source URLs in `reference/SOURCES.md` (ahrefs.com/site-explorer, /keywords-explorer, /rank-tracker, help.ahrefs.com articles, ahrefs.com/blog/how-to-use-ahrefs). No re-fetching.
- **Wall screenshots** (`shots/wall-20260907-HHMM-*.png`, timestamped): Common Crawl index refusing connections; Wikipedia exturlusage empty JSON; Reddit "Blocked"; Brave CAPTCHA; DuckDuckGo CAPTCHA; Bing's degraded RSS for "notion alternatives"; and one rendered copy of the terminal-only walls (Trends 429, Bing pagination ignored, index refusal). Earlier extras: `extra-ddg-captcha.png`, `extra-bing-serp-can-i-vibecode-it.png`.
- **Report recipients:** the writer (parent session) and the PM, same content.

## 9. Re-run for the final figure set (2026-09-08, 17:11–17:28 UTC)

Requested by the PM so every Ahrefs screenshot in the article is paired with an identical vibehrefs run. Same app (the process manager, the local dashboard), same method, no new features, public data only. Screenshots at 1280 wide in `the study's assets folder/`.

| Run | Measured | Screenshot |
|---|---|---|
| **superx.so** backlinks (new) | Vertex 110260621 (6 hosts). Edge scan 17:11:51→17:15:53 (4 min): **299 referring domains** in `cc-main-2026-jun-jul-aug`; 41 of them inside the top-1M ranking (best: amazonaws.com #34, beehiiv.com #2,235, saashub.com #17,785). Live homepage probe on the top 40: **0 carried the link** (2 unreachable: HTTP 403/429). Hacker News: 1 mention; Wikipedia: 0. **Linking pages and dates: 0** — the Common Crawl index server answered the health check at 17:17:18 and then refused every index query in the 9-minute fallback run (11 referring domains marked "index unreachable (rate-limited), not checked"; the run hit its timeout before reaching the other 4). This is the same wall as on 7 Sep (`shots/wall-20260908-1726-commoncrawl-index-ratelimited-superx-so.png`). | `clone-backlinks-superx-so.png` |
| **ahrefs.com** backlinks (re-shoot only) | Unchanged from 7 Sep: 116,776 referring domains; top 5,000 stored; 0 links found on 38 reachable homepages; 141 HN/Wikipedia mentions. | `clone-backlinks-ahrefs-com.png` (overwritten, restyled UI) |
| **calendly alternatives** (US, new) | **91 related ideas** from autocomplete (top: "calendly alternative open source", "calendly alternatives free reddit", "calendly alternatives google calendar", "calendly alternative self hosted"…). Google Trends: **HTTP 429 on the first call** (`shots/wall-20260908-1712-trends-429-calendly-alternatives.png`); a single retry 60 s later succeeded — 12-month avg 27.6, latest week 0, peak 100 (relative index, not a volume). Difficulty proxy **23** over the Bing top 10 (thedigitalprojectmanager.com, omnito.ai, lunacal.ai, acuityscheduling.com, forbes.com, alternativeto.net, meetergo.com, rigorousthemes.com, clickup.com, calendly-alternatives.org). Monthly volume: not available. | `clone-keywords-calendly-alternatives.png` |
| **granola pricing** (US, re-shoot) | Unchanged from 7 Sep: 73 ideas, Trends avg 37.1 / latest 8 / peak 100, difficulty 25 over a Bing top 10 that is 6/10 Dutch recipe sites. | `clone-keywords-granola-pricing.png` |

Walls in this run: Google Trends 429 (once, recovered on retry); Common Crawl index server rate-limiting from the first real query (not recovered within the run). Unchanged: `clone-backlinks.png` (canivibecodeit.com), `clone-keywords.png` (vibe coding), `clone-ranktracker.png`; rank tracker not re-run. Git: the app tree is unchanged by this re-run (no code change), so there is nothing new to commit; the local repo stays at 3 commits, no remote.
