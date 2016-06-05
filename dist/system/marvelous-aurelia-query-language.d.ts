declare module "marvelous-aurelia-query-language/query-language/query-language" {
	import { AureliaUtils } from 'marvelous-aurelia-core/aureliaUtils';
	export class QueryLanguage {
	    private _element;
	    private _aureliaUtils;
	    options: IQueryLanguageOptions;
	    autoCompletionResult: IAutoCompletionResult;
	    selectedCompletionIndex: number;
	    errors: string[];
	    private _subs;
	    private _queryInputElement;
	    private _preventFromFocusOut;
	    private _loading;
	    private _lastSubmittedQuery;
	    query: string;
	    constructor(_element: Element, _aureliaUtils: AureliaUtils);
	    attached(): void;
	    detached(): void;
	    submit(): void;
	    createOptions(): void;
	    validateOptions(): void;
	    autoComplete(): void;
	    anyCompletion(): boolean;
	    hideCompletions(): void;
	    select(completion: IAutoCompletionRow): void;
	    selectNext(): void;
	    selectPrevious(): void;
	    refreshCompletions(caretPosition?: any): void;
	    onCompletionClick(ev: any): void;
	    private registerInputHandlers();
	}
	export interface IQueryLanguageOptions {
	    autoComplete?: ((IAutoCompletionParams) => any) | string;
	    inlineButton?: boolean;
	    inlineButtonText?: string;
	    submitOnFocusOut?: boolean;
	    onSubmit?: () => any;
	}
	export interface IAutoCompletionParams {
	    query: string;
	    caretPosition: number;
	    skip: number;
	}
	export interface IAutoCompletionResult {
	    StartPosition: number;
	    Length: number;
	    Completions: IAutoCompletionRow[];
	    IsNextPageAvailable: boolean;
	    Errors: string[];
	    HasErrors: boolean;
	}
	export interface IAutoCompletionRow {
	    Text: string;
	    Group: string;
	}
}
declare module "marvelous-aurelia-query-language" {
	export function configure(aurelia: any): void;
	export * from 'marvelous-aurelia-query-language/query-language/query-language';
}