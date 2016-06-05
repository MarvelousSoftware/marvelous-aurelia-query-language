var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", 'aurelia-templating', 'aurelia-dependency-injection', 'marvelous-aurelia-core/utils', 'marvelous-aurelia-core/aureliaUtils'], function (require, exports, aurelia_templating_1, aurelia_dependency_injection_1, utils_1, aureliaUtils_1) {
    "use strict";
    var QueryLanguage = (function () {
        function QueryLanguage(_element, _aureliaUtils) {
            this._element = _element;
            this._aureliaUtils = _aureliaUtils;
            this.selectedCompletionIndex = 0;
            this.errors = [];
            this._subs = [];
            this._preventFromFocusOut = false;
            this.query = '';
        }
        QueryLanguage.prototype.attached = function () {
            this.validateOptions();
            this.createOptions();
            this.registerInputHandlers();
        };
        QueryLanguage.prototype.detached = function () {
            this._subs.forEach(function (x) { return x(); });
            this._subs = [];
        };
        QueryLanguage.prototype.submit = function () {
            var _this = this;
            if (this._lastSubmittedQuery === this.query) {
                // submits only if query has some changes
                return;
            }
            var promise = this.options.onSubmit();
            if (!promise || !(promise.then instanceof Function)) {
                return;
            }
            this._lastSubmittedQuery = this.query;
            this._loading = true;
            promise.then(function (x) {
                _this._loading = false;
                if (!x) {
                    return;
                }
                // if wrapped with DataSourceResult<T>
                // then uses `queryLanguage`
                // otherwise result is assumed to be QueryLanguageFilterResult<T>
                var result = x.queryLanguage || x;
                _this.errors = result.errors || [];
            }, function () { return _this._loading = false; });
        };
        QueryLanguage.prototype.createOptions = function () {
            var o = this.options;
            o.inlineButton = o.inlineButton === undefined ? true : o.inlineButton;
            o.inlineButtonText = o.inlineButtonText || 'Apply';
            o.submitOnFocusOut = o.submitOnFocusOut === undefined ? false : o.submitOnFocusOut;
            o.onSubmit = o.onSubmit || utils_1.Utils.noop;
        };
        QueryLanguage.prototype.validateOptions = function () {
            if (!this.options) {
                throw new Error('`options` attribute is required.');
            }
        };
        QueryLanguage.prototype.autoComplete = function () {
            var result = this.autoCompletionResult;
            var current = result.Completions[this.selectedCompletionIndex];
            var newQuery = this.query.substr(0, result.StartPosition);
            newQuery += current.Text;
            var caretPosition = newQuery.length;
            newQuery += this.query.substr(result.StartPosition + result.Length);
            this.query = newQuery;
            this.hideCompletions();
            utils_1.DomUtils.setCaretPosition(this._queryInputElement, caretPosition);
        };
        QueryLanguage.prototype.anyCompletion = function () {
            if (!this.autoCompletionResult || !this.autoCompletionResult.Completions) {
                return false;
            }
            return this.autoCompletionResult.Completions.length != 0;
        };
        QueryLanguage.prototype.hideCompletions = function () {
            this.selectedCompletionIndex = 0;
            if (this.autoCompletionResult)
                this.autoCompletionResult.Completions = [];
        };
        QueryLanguage.prototype.select = function (completion) {
            this.selectedCompletionIndex = this.autoCompletionResult.Completions.indexOf(completion);
        };
        QueryLanguage.prototype.selectNext = function () {
            if (this.selectedCompletionIndex == this.autoCompletionResult.Completions.length - 1) {
                this.selectedCompletionIndex = 0;
                return;
            }
            this.selectedCompletionIndex++;
        };
        QueryLanguage.prototype.selectPrevious = function () {
            if (this.selectedCompletionIndex == 0) {
                this.selectedCompletionIndex = this.autoCompletionResult.Completions.length - 1;
                return;
            }
            this.selectedCompletionIndex--;
        };
        QueryLanguage.prototype.refreshCompletions = function (caretPosition) {
            var _this = this;
            if (caretPosition === void 0) { caretPosition = utils_1.DomUtils.getCaretPosition(this._queryInputElement); }
            // TODO: debaunce		
            if (!this.options.autoComplete) {
                return;
            }
            var promise = undefined;
            var params = {
                query: this.query,
                caretPosition: caretPosition,
                skip: 0
            };
            var func = utils_1.Utils.createReadFunction(this.options.autoComplete, {
                allowData: false,
                dataMissingError: '`autoComplete` has to be either url or a function.',
                shouldReturnUrlOrPromiseError: '`autoComplete` function should return url or promise.'
            });
            // TODO: race condition! only last one should resolve
            func(params).then(function (x) {
                _this.selectedCompletionIndex = 0;
                _this.autoCompletionResult = x;
            });
        };
        QueryLanguage.prototype.onCompletionClick = function (ev) {
            utils_1.Utils.preventDefaultAndPropagation(ev);
            this.autoComplete();
        };
        QueryLanguage.prototype.registerInputHandlers = function () {
            var _this = this;
            var isInputClick = false;
            this._subs.push(utils_1.DomUtils.addEventListener(this._queryInputElement, "keyup", function (ev) {
                switch (ev.which) {
                    case 37: // Left
                    case 39: // Right
                    case 36: // Home
                    case 35:
                        _this.refreshCompletions();
                        break;
                    case 38: // Up
                    case 40:
                        if (!_this.anyCompletion()) {
                            _this.refreshCompletions();
                        }
                        break;
                    case 27:
                        _this.hideCompletions();
                        break;
                    case 16: // Shift
                    case 17: // Ctrl
                    case 18: // Alt
                    case 255: // Fn
                    case 13: // Enter
                    case 9:
                        break;
                    default:
                        _this.refreshCompletions();
                        break;
                }
            }));
            this._subs.push(utils_1.DomUtils.addEventListener(this._queryInputElement, "keydown", function (ev) {
                if (!_this.anyCompletion()) {
                    if (ev.which === 13) {
                        _this.submit();
                        utils_1.Utils.preventDefaultAndPropagation(ev);
                    }
                    return;
                }
                switch (ev.which) {
                    case 38:
                        _this.selectPrevious();
                        utils_1.Utils.preventDefaultAndPropagation(ev);
                        break;
                    case 40:
                        _this.selectNext();
                        utils_1.Utils.preventDefaultAndPropagation(ev);
                        break;
                    case 13: // Enter
                    case 9:
                        _this.autoComplete();
                        utils_1.Utils.preventDefaultAndPropagation(ev);
                        break;
                }
            }));
            this._subs.push(utils_1.DomUtils.addEventListener(this._queryInputElement, "mouseup", function (ev) {
                _this.refreshCompletions();
            }));
            this._subs.push(utils_1.DomUtils.addEventListener(this._queryInputElement, "mousedown", function (ev) {
                isInputClick = true;
            }));
            this._subs.push(utils_1.DomUtils.addEventListener(this._queryInputElement, "focus", function (ev) {
                if (!isInputClick && !_this._preventFromFocusOut) {
                    _this.refreshCompletions();
                }
                isInputClick = false;
            }));
            this._subs.push(utils_1.DomUtils.addEventListener(this._queryInputElement, "blur", function (ev) {
                if (_this._preventFromFocusOut) {
                    utils_1.Utils.preventDefaultAndPropagation(ev);
                    return;
                }
                _this.hideCompletions();
                isInputClick = false;
                if (_this.options.submitOnFocusOut) {
                    _this.submit();
                }
            }));
        };
        __decorate([
            aurelia_templating_1.bindable({ attribute: 'options' })
        ], QueryLanguage.prototype, "options", void 0);
        QueryLanguage = __decorate([
            aurelia_templating_1.customElement('m-query-language'),
            aurelia_dependency_injection_1.inject(Element, aureliaUtils_1.AureliaUtils)
        ], QueryLanguage);
        return QueryLanguage;
    }());
    exports.QueryLanguage = QueryLanguage;
});
