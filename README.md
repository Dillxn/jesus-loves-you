# Jesus Loves You

Minimal static site for https://jesuslovesyou.xyz.

The existing emblem is centered in white on a black background at 432 CSS pixels wide (three times the Offer Filter website footer's 144). `jesus-loves-you-emblem.svg` is a potrace vector trace of the Offer Filter master (`assets/jesus-loves-you-emblem.png`), filled white on the master's own 1412 × 1114 canvas. The favicon (`favicon.svg`, with `favicon-32.png` and `apple-touch-icon.png` rendered from it) is the headline alone, without the passage, white on black. The emblem floats up and down and turns about 10° left and right (CSS), while a small inline script draws a slow vortex of dust that circles it, passing behind and in front, and rises off the top of the screen. Visitors who ask for reduced motion get the still emblem. Link previews (Open Graph and Twitter cards) use `og-image.png`, a 1200 × 630 render of the page with the emblem held still. There are no dependencies or build step.

Serve the `public` directory. On Render, use a Static Site with the `public` publish directory and automatic deploys disabled. Publishing must respect the owner's local-build policy.

The Render service is `jesus-loves-you` (https://jesus-loves-you.onrender.com), deployed by hand from the Render dashboard. To serve it at the domain, add `jesuslovesyou.xyz` and `www.jesuslovesyou.xyz` as custom domains on that service, then set these records at GoDaddy, replacing the existing `@` A records and any domain forwarding:

| Type  | Name  | Value                          |
|-------|-------|--------------------------------|
| A     | `@`   | `216.24.57.1`                  |
| CNAME | `www` | `jesus-loves-you.onrender.com` |
