"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
function configure(aurelia) {
    aurelia.globalResources('./query-language/query-language');
}
exports.configure = configure;
__export(require('./query-language/query-language'));
