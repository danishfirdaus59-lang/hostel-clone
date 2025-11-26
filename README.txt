Hostel Clone Bundle (mock CUIMS)
Files:
- Hostel_pass.html        (updated page; click Hostel Leave opens local page)
- CUIMS_Profile.html      (cloned profile page)
- fake-backend.js         (client-side mock login + localStorage leave/profile)
- README.txt              (this file)

How it works:
- The site is fully client-side. No server required.
- When first opened, a small mock login overlay asks for your display name (stored in browser).
- Submitting the leave form saves an entry to localStorage (key: mock_leaves) and shows it in the Previous Leave area.
- Profile page has an editable local profile panel (saves to mock_profile in localStorage).

Deploy:
1) GitHub Pages:
   - Create a GitHub repo, push the files (Hostel_pass.html, CUIMS_Profile.html, fake-backend.js).
   - Enable Pages from the repo settings (branch: main, folder: root).
   - Visit: https://<username>.github.io/<repo>/Hostel_pass.html

2) Netlify / Vercel:
   - Drag & drop the bundle (or point to repo).
   - Publish and share the URL.

Notes:
- All data is stored in each user's own browser (localStorage) and is private to their device.
- This clone DOES NOT connect to real CUIMS or submit real requests.
