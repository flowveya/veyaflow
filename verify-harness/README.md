# verify-harness — invocation contract

- `eq.js` loads `./shake2.js` by relative path, so the two files must sit in the same directory.
- Both `require('acorn')`. Neither file vendors it: it is resolved from the repo's `node_modules`
  through `NODE_PATH`.
- `eq.js` takes one argument, the path of an `index.html` to evaluate, and prints its results to stdout.

## Exact command lines used for the predicate batch's equivalence run (22 Sep 2026)

Run from the session scratch directory `pred/`, which held these two files plus two copies of
`index.html`: `index.head.html` (from `git show HEAD:index.html` at `3820863`, digest `5dac2427`)
and `index.edit.html` (the working tree, digest `52d0a88f`):

```
NODE_PATH=/Users/charlotte/claude-code-test/node_modules node eq.js index.head.html > head.out 2>&1
NODE_PATH=/Users/charlotte/claude-code-test/node_modules node eq.js index.edit.html > edit.out 2>&1
diff head.out edit.out
```
