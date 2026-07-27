SALIDO RESORT — LIVE GOOGLE REVIEWS SETUP

The review card now shows the verified fallback visible on the supplied Google listing:
- Rating: 3.2
- Review count: 19

To load the current rating and Google-provided review excerpts automatically:

1. Open Google Cloud Console and select/create a project.
2. Enable billing for the project.
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
4. Create an API key.
5. Apply Website restrictions (HTTP referrers), for example:
   https://yourdomain.com/*
   https://www.yourdomain.com/*
6. Apply API restrictions to Maps JavaScript API and Places API.
7. In index.html, replace:
   window.SALIDO_GOOGLE_MAPS_API_KEY = "";
   with:
   window.SALIDO_GOOGLE_MAPS_API_KEY = "YOUR_KEY_HERE";
8. Upload the site to HTTPS hosting.

IMPORTANT
- Do not test the restricted browser key by opening index.html as file://. Use an HTTPS website or a local HTTP server.
- Google Places generally returns only a limited selection of review excerpts, not every review.
- The live API result replaces the fallback rating and count when the request succeeds.
- Keep the Google attribution and link visible.
