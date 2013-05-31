backbone.ts
===========

Full backbone.js port to typescript, this is not just a definitions file (backbone.d.ts) for backbone.js.

Build
=====

To generate the single backbone.min.js and backbone.d.ts files install node and run the following commands from the root project directory.

Dependencies:
* node.js
* grunt.js

```javascript
npm install
grunt
```

Changelog
=========

v0.3
====

Added automated build to generate single .js and .d.ts files.

Build Dependencies
* node.js (pkg deps)
* grunt.js (automated build)
* tsc (typescript compiler)

Runtime Dependencies
* jQuery
* underscore.js

v0.2
====

Expirmental, more direct typing.  Removing the readme from this section since it is quite large and outdated.

v0.1
=============================

Direct port, tagged as v0.1
Was also labeled as backbone.ts 0.9.2 (was the current version of backbone.js available at the time)

