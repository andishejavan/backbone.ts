backbone.ts
===========

Full backbone.js port to typescript, this is not just a definitions file (backbone.d.ts) for backbone.js.

Usage
=====

Download:
* backbone-x.y.z.min.js
* backbone-x.y.z.d.ts

Reference .min.js file into your application's html.
```javascript
<script src="backbone.0.3.0.min.js" />
```

Reference .d.ts file into your project solution to gain typing definitions.
```javascript
/// <reference path="backbone.0.3.0.d.ts" />
````

Build
=====

To generate the single backbone.min.js and backbone.d.ts files install node and run the following commands from the root project directory.

```javascript
npm install -g grunt-cli	// installs grunt globally
npm install					// installs backbone.ts deps locally
grunt						// runs automated build
```

Acknowledgements
================
Original backbone.js!  Awesome library and inspiration for building a similar more type friendly version in typescript.
http://backbonejs.org/

Changelog
=========

v0.3
====

Added automated build to generate single .js and .d.ts files.

Build Dependencies:
* node.js (pkg deps)
* grunt-cli (automated build)
* tsc (typescript compiler)

Runtime Dependencies:
* jQuery
* underscore.js

v0.2
====

Expirmental, more direct typing.  Removing the readme from this section since it is quite large and outdated.

v0.1
=============================

Direct port, tagged as v0.1
Was also labeled as backbone.ts 0.9.2 (was the current version of backbone.js available at the time)

