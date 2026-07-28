# Managed Website Files

This folder contains files that support the public website but are not directly loaded as normal page assets.

## Folders

- `google-apps-script/Code.gs` - backend code for the Google Sheet-bound Apps Script.
- `SECURITY-CHECKLIST.md` - security rules for the Sheet, Apps Script, and public forms.

## Important

Do not put private passwords, Sheet edit links, service-account keys, or admin-only data in public website files. Browser code is always visible to visitors.

When backend changes are needed, update `managed/google-apps-script/Code.gs`, then paste/deploy it in Google Apps Script.
