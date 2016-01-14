# Static assets folder

Place static assets that **will** be tracked in Git within this folder.

## Don't add large media files
Do not place large media assets in these directories. Adding large binary
files to a Git repo will cause all sorts of performance problems.

## Don't add assets that don't match our application license
By default we share application code on GitHub and other sources. So don't
add assets to your git repo that you don't have rights to share publicly.

For instance, you might have permission to use images or fonts in a project,
but that doesn't mean you have the rights to share them under a MIT license
on a public code repo.

Add these sorts of assets to the `/app/assets/dynamic/` directory.

## Organize assets into folders

For example:
/app/assets/dynamic/fonts
/app/assets/dynamic/images
/app/assets/dynamic/icons
