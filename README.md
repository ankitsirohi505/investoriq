# InvestorIQ: public website (demo)

The public marketing website of InvestorIQ, an Australian manager of infrastructure and real assets, used in the InvestorIQ Salesforce demo. It is the public face of the InvestorIQ investor portal (Experience Cloud site `investors`).

Live: https://ankitsirohi505.github.io/investoriq/

Demo prototype. InvestorIQ is a fictional brand. Funds, assets, people and figures are illustrative demo data and are not an offer of financial products.

## What's on the page

One page with a sticky header and anchored sections:

- **Hero**: headline, calls to action and illustrative key figures (A$14.2bn funds under management, 14 assets, 120+ investors, since 2017).
- **Strategies**: Australian infrastructure, core property, global infrastructure.
- **Funds**: Australian Infrastructure Fund (AIF), Core Property Fund (CPF), Global Infrastructure Fund (GIF) and Global Infrastructure Fund II (GIF2, pre-launch, by invitation). Draft NAV, target net IRR and the other facts match the demo data in the org (`IIQ_DemoData`, `IIQ_DemoAlign`, `IIQ_DemoStory.seedMetrics`). **Request data room access** on a card ticks that fund in the form.
- **Portfolio highlights**: map of the Australian assets with a filter by fund, plus GIF's offshore assets.
- **The investor experience**: what the portal gives investors (data rooms, document centre, capital calls, portfolio, queries, AI assistant).
- **Responsible investment**, **Insights** (the three `IIQ_Insight__c` items), **About** (Alex Chen and Sarah Jones).
- **Request portal access** form and the footer with the privacy notice and disclaimer.

**Investor login** goes to https://miet3.my.site.com/investors/login.

## How the request-access form works

`assets/app.js` posts the form, without cookies or a referrer, to the endpoint set in `CONFIG` at the top of the file:

```
POST https://miet3.my.site.com/investorsvforcesite/services/apexrest/iiq/access-request
Content-Type: application/json
```

The request uses `mode: 'cors'`, `credentials: 'omit'`, `cache: 'no-store'`, `referrerPolicy: 'no-referrer'` and gives up after 20 seconds.

Body:

| Key | Value |
| --- | --- |
| `firstName`, `lastName`, `email`, `organisation` | required |
| `phone`, `title`, `message` | optional, empty string when blank |
| `investorType` | `Superannuation fund`, `Pension fund`, `Insurance company`, `Sovereign wealth fund`, `Endowment or foundation`, `Family office`, `Fund of funds` or `Other` |
| `country` | `Australia` (default), `New Zealand`, `Singapore`, `United Kingdom`, `United States` or `Other` |
| `fundInterests` | array of fund codes, at least one of `AIF`, `CPF`, `GIF`, `GIF2` |
| `commitmentRange` | `Under A$25m`, `A$25m to A$100m`, `A$100m to A$250m`, `Over A$250m`, or empty |
| `wholesaleConfirmed`, `privacyConsent` | `true` (both must be ticked) |
| `website` | honeypot: a hidden field people leave empty; its value is sent as is |
| `source` | `investoriq-site` |

Responses:

- `200` with `{"ok": true, "reference": "IIQ-XXXXXX", "message": "..."}`: the page shows the reference and message.
- `{"ok": false, "error": "..."}` or any other status: the page shows the error text (or a general message).
- No answer, or no answer within 20 seconds: the page asks the visitor to try again and keeps what they typed.

A fund can be ticked from a link: `?fund=AIF` (or `CPF`, `GIF`, `GIF2`; several with commas, for example `?fund=AIF,CPF`).

Because the body is JSON, the browser sends a CORS preflight first. `https://ankitsirohi505.github.io` must be on the org's CORS allowlist, and the site's guest user needs access to the Apex REST class.

### On the Salesforce side

1. The request becomes an **IIQ Investor Prospect** lead.
2. The relationship manager (Alex Chen) reviews it.
3. On approval the lead is converted to an **IIQ Prospect** account and contact.
4. A portal login is created and InvestorIQ emails the investor a set-password link. Passwords and bank details are never sent by email.

## Run locally

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765/. All links and asset paths are relative, so the site also works under `/investoriq/` on GitHub Pages. To try the GitHub Pages path locally, serve the parent folder of a folder (or symlink) named `investoriq` and open http://localhost:8765/investoriq/.

Submitting the form locally posts to the real endpoint above, and only works if the org's CORS allowlist includes your local address.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | the page, with inline SVG illustrations |
| `assets/app.css` | styles (colours and fonts from the investor portal) |
| `assets/app.js` | menu, map filter, scroll effects and the request-access form (`CONFIG` at the top) |
| `assets/favicon.svg` | site icon |
| `.nojekyll` | serve the files as they are on GitHub Pages |

No frameworks, trackers, analytics or cookies. Fonts (Inter and Inter Tight) come from Google Fonts. A Content Security Policy only allows scripts from the site itself and lets the page send data only to `miet3.my.site.com`. The page carries `noindex` so search engines don't list the fictional brand.
