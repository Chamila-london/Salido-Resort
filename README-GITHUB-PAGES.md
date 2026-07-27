# Salido Resort — GitHub Pages upload guide

This folder is ready to be uploaded directly to a GitHub repository.

## Upload using the GitHub website

1. Create a new GitHub repository, for example `salido-resort`.
2. Open the repository and select **Add file → Upload files**.
3. Upload the **contents of this folder**, including `index.html`, rather than uploading the ZIP file.
4. Commit the files to the `main` branch.
5. Open **Settings → Pages**.
6. Under **Build and deployment**, choose **Deploy from a branch**.
7. Select branch **main** and folder **/(root)**, then save.

The site should become available at:

`https://YOUR-USERNAME.github.io/salido-resort/`

GitHub may take several minutes to publish the first deployment.

## Important files

- `index.html` — public homepage
- `admin/index.html` — admin interface
- `.nojekyll` — ensures GitHub Pages serves all static files unchanged
- `css/`, `js/`, `images/`, `fonts/` — website assets

## Google rating and reviews

The current package contains the static Google rating fallback. Live Google review data requires a Google Places API key and billing-enabled Google Cloud project. Do not commit an unrestricted secret key. A browser key must be restricted to your GitHub Pages hostname and only the required Google APIs.

## Custom domain

After GitHub Pages is working, you can enter your domain under **Settings → Pages → Custom domain**. Update `robots.txt`, `sitemap.xml`, and canonical/social URLs in `index.html` to use the final domain.
