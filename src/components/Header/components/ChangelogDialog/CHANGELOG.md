#### 4.1.0 (2022-03-15)

This is a big update for Geometra with a focus on optimization and performance upgrades. Read the full post at: [https://rukkor.com/geometra/geometra-4-1-is-out/](https://rukkor.com/geometra/geometra-4-1-is-out/).

**New features and upgrades**

Some new features are also showing up in 4.1. While none of them is individually game-changing, they make up for a ton of Quality-of-Life improvements.

- Added Changelog to the application under the megaphone icon in the top right
- Estimate tree should now remember per project which folders were open or closed
- QuickSwitch should now remember per project which folders were open or closed
- QuickSwitch now only requires a single click to change to a new file
- QuickSwitch should now highlight the currently active file
- Amount formula has been added to Row exports
- Projects should now list 50 projects as default instead of 20
 
**And we’ve killed off a ton of bugs**

- Loading of files in Drive where it could stop at 50% has been resolved
- Drive should now correctly update files when new Objects are placed
- Deleting Rows from Reductions should now work correctly
- Placing multiple Scales should now function correctly
- Copied Rows should now summarize properly
- Unit should now be correctly saved and respected in Rows
- AutoComplete for Rows should now behave properly and show correct data
- AutoComplete for New Row should now behave properly and show correct data
- Inheritance for all Object types have been reviewed and several minor bugs fixed
- Fixed a bug where SnapOn couldn’t be used with Scales in some cases
- Fixed a bug where Image Objects couldn’t be moved to folders
- Fixed a bug where Reset Password didn’t always work correctly
- Fixed a bug where Project Name wasn’t correctly reflected in the header after a change
- Fixed a bug where Project Leader wasn’t always correctly loaded
- Fixed a bug where inserting text with an incorrect decimal point in Amount could result in an Error in Formula and not be converted correctly

---
#### 4.0.21 (2022-02-08)

- Rows Affected Objects fix

---

#### 4.0.20 (2022-02-08)

- Ctrl + A Hotfix

---

#### 4.0.19 (2022-02-07)

- Major performance update on properties pane
- Performance update on rows
- Smaller bug fixes

---

#### 4.0.18 (2022-02-02)

- Fixed bug with total time not being updated instantly
- Fixed bug with with copied annotations with rows for instant  update
- Fixed structure for folders and annotations when using move in tree.

---

#### 4.0.17 (2022-02-01)

- Pressing 'Enter' should now save file name in Drive
- Improvements to replace rows functionality
- Fixed a bug with replacing rows
- Added 'Nr/Tag' and 'Name' to delete rows dialog
- Deleting a single row now requires confirmation
- Improved some localization

---

#### 4.0.16 (2022-01-31)

This release includes the first round of optimization to improve overall performance. We'll continue to work on performance upgrades as we go forward.

- Fixed several issues with opacity for fills and borders on objects
- Fixed a bug with exports which 'Affected objects' column
- Added the name of the estimate to the exports

---

#### 4.0.15 (2022-01-23)

- Fixed a crash that could occur sometimes when selecting groups

---

#### 4.0.14 (2022-01-20)

- Added controlled fields for 'Quantity' and 'Height' to prevent incorrect entries
- Fixed a bug with displaying values for scales in toolbar
- Fixed a crash that could occur sometimes when opening the Tiles dialog

---

#### 4.0.13 (2022-01-19)

- 'Quantity' is no longer inherited between objects
- Added a confirmation prompt to deleting an estimate
- Replaced 'Feedback' tool, file uploads should now work better, limit 5MB
- Fixed a bug causing right click menu to not work for Rows
- Fixed a bug preventing adding folder templates to an empty estimate
- Labels should not longer be selected when dragging a selection on the PDF, hold ALT to select them as well
- Fixed a bug with uploading files with uppercase extensions
- Minor localization improvements

---

#### 4.0.12 (2022-01-17)

- Made several improvements for backwards compatibility with projects from previous version of Geometra.

#### 4.0.11 (2022-01-16)

- Fixed a bug with uploading files that contain annotations
- Fixed a bug with adding rows when no scale was set
- Minor security updates

---

#### 4.0.10 (2022-01-12)

- Made improvements to the upload flow when importing annotations from files

---

#### 4.0.9 (2022-01-12)

- Localization improvements

---

#### 4.0.8 (2022-01-11)

- Hotfix for a type conversion error

---

#### 4.0.7 (2022-01-11)

- Improved functionality of hotkeys
- Fixed some issues with entering Height
- Fixed a bug with reductions sometimes not correctly being copied
- Fixed a bug with renaming folders
- Fixed a bug allowing the root folder to in a special case be deleted in Drive

---

#### 4.0.6 (2022-01-11)

- Hotfix for Space hotkey

---

#### 4.0.5 (2022-01-11)

- Added a new way to load projects massively increasing loading performance
- Added and reviewed hotkeys through the app, read more: https://geometra.tawk.help/article/hotkeys
- Inverted the colours of the trees in Drive and Estimate to increase contrast
- Fixed a bug with copy/pasting between pages in a PDF
- Fixed a bug with clearing search inputs when switching views
- Minor security updates

---

#### 4.0.4 (2022-01-09)

- Fixed a bug with copy/pasting between pages in a PDF

---

#### 4.0.3 (2022-01-06)

- Added more visible scrollbars to app
- Changed handle for resizing panes to be easier to work with
- Improvements on backend and server for deployment
- Fixed a bug with ESC hotkey not dropping tool and selection correctly
- Fixed a bug with duplicating objects
- Fixed a render call bug that was detrimental to UI performance

---

#### 4.0.2 (2022-01-04)

- Fixed several issues regarding login and login sequences
- Fixed issues with password reset email
- Several large localization improvements
- Fixed several bugs with exports, mainly for projects from previous version of Geometra

---

#### 4.0.1 (2022-01-03)

- Fixed an issue regarding deployment of app stack

---

#### 4.0.0 (2022-01-03)

Official release of Geometra 4.0.0
