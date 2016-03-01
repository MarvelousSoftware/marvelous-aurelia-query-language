import {customElement, bindable} from 'aurelia-templating';
import {inject} from 'aurelia-dependency-injection';
import {Utils, DomUtils} from 'marvelous-aurelia-core/utils';
import {AureliaUtils} from 'marvelous-aurelia-core/aureliaUtils';

@customElement('m-query-language')
@inject(Element, AureliaUtils)
export class QueryLanguage {
	@bindable({attribute:'options'}) options: IQueryLanguageOptions;
	
	autoCompletionResult: IAutoCompletionResult;
	selectedCompletionIndex: number = 0;
	
  errors: string[] = [];
  
	private _subs = [];
	private _queryInputElement: HTMLInputElement;
	private _preventFromFocusOut = false;
	
	private _loading: boolean;
	private _lastSubmittedQuery: string;
		
	get query(): string { return this._queryInputElement.value; }
	set query(value) { this._queryInputElement.value = value; }
		
	constructor(private _element: Element, private _aureliaUtils: AureliaUtils) {
	}
	
	attached() {
		this._queryInputElement = <any>this._element.querySelector('input');

		this.validateOptions();		
		this.createOptions();
		
		this.registerInputHandlers();		
	}
	
	detached() {
		this._subs.forEach(x => x());
		this._subs = [];
	}
	
	submit() {
		if(this._lastSubmittedQuery === this.query) {
			// submits only if query has some changes
			return;
		}
				
		let promise = this.options.onSubmit();
		if(!promise || !(promise.then instanceof Function)) {
			return;
		}
		
		this._lastSubmittedQuery = this.query;
		
		this._loading = true;
		promise.then((x) => {
			this._loading = false;
			
			if(!x) {
				return;
			}
						
			// if wrapped with DataSourceResult<T>
			// then uses `queryLanguage`
			// otherwise result is assumed to be QueryLanguageFilterResult<T>
			let result = x.queryLanguage || x; 			
			this.errors = result.errors || [];
		}, () => this._loading = false);
	}
	
	createOptions() {
		let o = this.options;
		o.inlineButton = o.inlineButton === undefined ? true : o.inlineButton;
		o.inlineButtonText = o.inlineButtonText || 'Apply';
		o.submitOnFocusOut = o.submitOnFocusOut === undefined ? false : o.submitOnFocusOut;
		o.onSubmit = o.onSubmit || Utils.noop;
	}
	
	validateOptions() {
		if(!this.options) {
			throw new Error('`options` attribute is required.');
		}
	}
	
	autoComplete() {
		let result = this.autoCompletionResult;
		let current = result.Completions[this.selectedCompletionIndex];
		
		let newQuery = this.query.substr(0, result.StartPosition);
		newQuery += current.Text;
		let caretPosition = newQuery.length;		
		newQuery += this.query.substr(result.StartPosition + result.Length);
			
		this.query = newQuery;
		
		this.hideCompletions();
		DomUtils.setCaretPosition(this._queryInputElement, caretPosition);
	}
	
	anyCompletion() {
		if(!this.autoCompletionResult || !this.autoCompletionResult.Completions) {
			return false;
		}
		return this.autoCompletionResult.Completions.length != 0;
	}
	
	hideCompletions() {
		this.selectedCompletionIndex = 0;
		
		if(this.autoCompletionResult)
			this.autoCompletionResult.Completions = [];
	}
	
	select(completion: IAutoCompletionRow) {
		this.selectedCompletionIndex = this.autoCompletionResult.Completions.indexOf(completion);
	}
	
	selectNext() {
		if(this.selectedCompletionIndex == this.autoCompletionResult.Completions.length - 1) {
			this.selectedCompletionIndex = 0;
			return;
		}
		this.selectedCompletionIndex++;
	}
	
	selectPrevious() {
		if(this.selectedCompletionIndex == 0) {
			this.selectedCompletionIndex = this.autoCompletionResult.Completions.length - 1;
			return;
		}
		this.selectedCompletionIndex--;
	}
	
	refreshCompletions(caretPosition = DomUtils.getCaretPosition(this._queryInputElement)) {
		// TODO: debaunce		
		if(!this.options.autoComplete) {
			return;	
		}
		
		let promise = undefined;
		let params = {
			query: this.query,
			caretPosition: caretPosition,
			skip: 0
		}
		
		let func = Utils.createReadFunction(this.options.autoComplete, {
			allowData: false,
			dataMissingError: '`autoComplete` has to be either url or a function.',
			shouldReturnUrlOrPromiseError: '`autoComplete` function should return url or promise.'
		});
		
		// TODO: race condition! only last one should resolve
		func(params).then((x: IAutoCompletionResult) => {
			this.selectedCompletionIndex = 0;
			this.autoCompletionResult = x;
		});
	}
	
	onCompletionClick(ev) {
		Utils.preventDefaultAndPropagation(ev);
		this.autoComplete();
	}
	
	private registerInputHandlers() {
		let isInputClick = false;
		
		this._subs.push(DomUtils.addEventListener(this._queryInputElement, "keyup", (ev: KeyboardEvent) => {
			switch(ev.which) {
				case 37: // Left
				case 39: // Right
				case 36: // Home
				case 35: // End
					this.refreshCompletions();				
					break;
				case 38: // Up
				case 40: // Down
					if(!this.anyCompletion()) {
						this.refreshCompletions();
					}
					break;
				case 27: // Esc
				 	this.hideCompletions();
					break;
				case 16: // Shift
				case 17: // Ctrl
				case 18: // Alt
				case 255: // Fn
				case 13: // Enter
				case 9: // Tab
					break;
				default:
					this.refreshCompletions();
					break;
			}
		}));
		this._subs.push(DomUtils.addEventListener(this._queryInputElement, "keydown", (ev: KeyboardEvent) => {			
			if(!this.anyCompletion()) {
				if(ev.which === 13) { // Enter
					this.submit();
					Utils.preventDefaultAndPropagation(ev);
				}
				
				return;										
			}
			
			switch(ev.which) {
				case 38: // Up
					this.selectPrevious();
					Utils.preventDefaultAndPropagation(ev);
					break;
				case 40: // Down					
					this.selectNext();
					Utils.preventDefaultAndPropagation(ev);
					break;
				case 13: // Enter
				case 9: // Tab				 
					this.autoComplete();
					Utils.preventDefaultAndPropagation(ev);
					break;
			}
		}));
		this._subs.push(DomUtils.addEventListener(this._queryInputElement, "mouseup", (ev: KeyboardEvent) => {
			this.refreshCompletions();				
		}));
		this._subs.push(DomUtils.addEventListener(this._queryInputElement, "mousedown", (ev: KeyboardEvent) => {
			isInputClick = true;				
		}));
		this._subs.push(DomUtils.addEventListener(this._queryInputElement, "focus", (ev) => {
			if(!isInputClick && !this._preventFromFocusOut) {
				this.refreshCompletions();				
			}
			isInputClick = false;				
		}));
		this._subs.push(DomUtils.addEventListener(this._queryInputElement, "blur", (ev) => {
			if(this._preventFromFocusOut) {
				Utils.preventDefaultAndPropagation(ev);
				return;
			}
			
			this.hideCompletions();
			isInputClick = false;
			
			if(this.options.submitOnFocusOut) {
				this.submit();
			}
		}));
	}
}

export interface IQueryLanguageOptions {
	autoComplete?: ((IAutoCompletionParams) => any) | string;
	inlineButton?: boolean;
	inlineButtonText?: string;
	submitOnFocusOut?: boolean;
	onSubmit?: () => any;
}

export interface IAutoCompletionParams {
	query: string,
	caretPosition: number,
	skip: number
}

export interface IAutoCompletionResult {
	StartPosition: number,
  Length: number,
  Completions: IAutoCompletionRow[],
  IsNextPageAvailable: boolean,
  Errors: string[],
  HasErrors: boolean
}

export interface IAutoCompletionRow {
	Text: string,
	Group: string
}