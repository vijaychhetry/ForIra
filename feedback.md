# Plan Reviewer Feedback

Scope reviewed: ForIra-100, ForIra-o40, ForIra-k41, ForIra-735 and their child tasks only (29 total open issues in the DB; only these 4 subtrees were assessed).

## Criteria Assessment

Criteria 1,2,4,6,7,9,10 all **PASS**: 
- Each of the 4 sprint goals is itself the feature addressing its own goal
- Each has exactly one [test] task (ForIra-100.1, ForIra-o40.1, ForIra-k41.1, ForIra-735.1) correctly placed downstream of its implementation tasks
- Confirmed via `bd graph --compact` layering: tests sit in the last layer of each subtree
- No task lists more than 3 files
- No scope creep or duplicate work found
- Every task in scope has a `model` metadata key set (no criterion-10 fallback needed for any of the 16 in-scope tasks)
- Scoped ready-check (`bd list --parent <root> --ready --json`) returned non-empty results for all 4 roots:
  - ForIra-100 -> [ForIra-cdb]
  - ForIra-o40 -> [ForIra-9ud, ForIra-c1b, ForIra-119]
  - ForIra-k41 -> [ForIra-9jt, ForIra-7eg]
  - ForIra-735 -> [ForIra-i0c, ForIra-ij4]
- No cycle detected

## Criterion 8 (Feasibility) - FAILS

**One concrete cross-feature bug:**

ForIra-ij4 ('Add sentence data to readingContent.ts', under ForIra-735) explicitly states 'Files to change: app/constants/readingContent.ts (append to existing file)'. However, this file does not exist yet in the repo (verified) and is created fresh by ForIra-c1b ('Create readingContent.ts with matra word data', under ForIra-o40, 'Files to change: app/constants/readingContent.ts (new)'). 

`bd dep list ForIra-ij4` shows its only dependency is the parent-child edge to ForIra-735 -- there is NO blocks edge to ForIra-c1b. Since ForIra-ij4 is currently in the ready set for the ForIra-735 scope alongside ForIra-i0c, a doer could pick it up before ForIra-c1b runs, and 'append to existing file' would fail (file doesn't exist) or silently create a divergent file that conflicts with c1b's later creation.

**Fix:** `bd dep add ForIra-ij4 ForIra-c1b` (adds a blocks/depends-on edge so ij4 is not ready until c1b's file exists).

## Secondary Feasibility Risk

**Lower severity, flagged for awareness** (not a hard scope violation since the referenced work lives in ForIra-akr which is outside this review's 4 sprint goals):

ForIra-3r6 ('Create MascotBadge floating component', under ForIra-k41) has an acceptance criterion 'Tapping badge navigates to AvatarScreen route' with no 'placeholder OK' escape hatch (unlike ForIra-cdb, which explicitly allows placeholder routes for not-yet-built screens). AvatarScreen is built by ForIra-kkm under the separate feature ForIra-akr ('Avatar Customization System'), which is open/not started and has no dependency edge from ForIra-3r6. 

If ForIra-akr isn't completed in this sprint, ForIra-3r6's acceptance criterion cannot be met as literally written. 

**Recommendation:** Either:
- (a) Add a 'placeholder route OK if AvatarScreen not yet built' clause to ForIra-3r6's description, mirroring ForIra-cdb, OR
- (b) Wire `bd dep add ForIra-3r6 ForIra-kkm` if AvatarScreen must exist before this task can be verified done.

## Summary

No other criteria failures found. Task-size/model assignments below assume the above two fixes are applied before doer dispatch.
