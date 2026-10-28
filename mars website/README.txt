MARS Training & Solution: new website
=====================================

What's in this folder
  index.html     Home page
  courses.html   All courses, with search and category filter
  jobs.html      Job openings (read live from the "Job Openings" tab in your Google Sheet)
  join.html      Join as a Trainer form (applications + resumes go to your Google Sheet)
  gallery.html   Training photo gallery (photos load from your existing site's uploads folder,
                 so do not delete wp-content/uploads from the hosting)
  assets/        style.css, site.js, logo.png, icon.png

Settings you can change later (optional)
  Open assets/site.js in Notepad:
  1. enquiryApp: already set to 'https://marstraining.netlify.app'.
     "Enroll Now" opens the app's Enroll tab; every "Enquire" button opens its Enquire tab.
     If the app link ever changes, change it here.
  2. api: already set to your Apps Script web app link (ends in /exec).
     The Join as a Trainer form sends applications through it. If you ever create a
     brand-new Apps Script deployment, paste its new /exec link here.
  3. To add, remove or rename a course, edit the COURSES list in the same file.
     Each line is: ['Category', 'Course name', 'Short description', 'Popular' or 'New' (optional)]

HOW TO PUT IT ON YOUR EXISTING HOSTING (marstraining.in)
---------------------------------------------------------
Keep your current host. Your domain, email (contactus@marstraining.in) and DNS do not change.

1. Get access. Ask your web person for the hosting control panel (cPanel) login,
   or ask them to do steps 2 to 4 for you.

2. Back up first. In cPanel open "Backup" (or "Backup Wizard") and download a full backup.
   Or ask your web person to take one.

3. Upload. In cPanel open "File Manager", go into the public_html folder
   (the one that contains wp-config.php and index.php).
   Upload index.html, courses.html, gallery.html, join.html, jobs.html and the whole assets folder.
   Do NOT delete or overwrite anything that is already there.
   (Easiest: upload this zip into public_html and click "Extract".
    If the zip extracts into a subfolder, move the files up into public_html.)

4. Check. Open https://marstraining.in in a private/incognito window.
   The server shows index.html before WordPress's index.php, so the new home page appears.
   Your old WordPress pages keep working, including the blog, downloads, gallery and wp-admin.

   Still seeing the old site?
   a) In File Manager, enable "Show hidden files", open .htaccess and add this as the very first line:
         DirectoryIndex index.html index.php
   b) If a cache plugin (WP Rocket, LiteSpeed Cache, W3 Total Cache) or Cloudflare is used,
      click "Purge all cache".

To undo: rename index.html to index-new.html. The old WordPress home page comes straight back.

Updating later: edit the file on your computer and upload it again over the old one.

Why not move to a new host?
  Moving means changing DNS, and a mistake there can break your company email.
  A static site this size runs fast on your current hosting.
  Later, if you want free hosting and drop WordPress completely, Netlify is a good option.
  Do that only with your web person, because the email (MX) records must be copied exactly.

ADDING A JOB OPENING (no website upload needed)
-----------------------------------------------
1. Upload the flyer image to Google Drive (any folder). Right-click > Share > Copy link.
2. In the MARS ENQUIRY sheet, open the "Job Openings" tab and add a row:
   Show = Yes, Job Title, Company, Salary etc., and paste the link in "Flyer Link".
   Apply WhatsApp = the number applicants should message (leave empty to use 9870259245).
   Last Date (optional) = the job disappears by itself after this date.
3. Within 5 minutes it appears on the Jobs page and on the home page.
To remove a job, set Show = No.
