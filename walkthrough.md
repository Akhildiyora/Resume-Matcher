# Modern UI Walkthrough

## Dashboard Shell

The app now opens into a tabbed dashboard with three focused work areas:

- Resume Studio for uploading and parsing resumes.
- Job Board for filtering jobs, reading skill demand, and loading candidate matches.
- Match Lab for direct match lookup, recommendations, and resume comparison.

Tabs keep each workflow mounted in the browser, so switching sections does not reset form inputs or loaded results.

## Resume Studio

Use the drag-and-drop upload zone to add a resume. After upload, the right-side profile panel displays extracted experience, education, and domain. Detected skills appear in categorized badges, and live socket progress updates appear under the result area.

## Job Board

Use the filter row to narrow jobs by skill, domain, experience, and sort order. Job cards show match score, role metadata, skills, and breakdown bars. Selecting "View Matching Candidates" loads candidate details into the recruiter panel without leaving the page.

## Match Lab

Enter a resume ID to load role matches, request job recommendations, or compare two resumes. Match and recommendation results use the same badge and score system as the rest of the dashboard for consistent review.

## Visual System

The UI uses a light glass dashboard style, compact 8px radii, stable controls, categorized accents, and the existing workspace image asset. It avoids deep monochrome palettes while keeping strong contrast for form-heavy hiring workflows.
