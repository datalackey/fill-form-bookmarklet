export interface LabelResult {
    text: string;
    pattern: number | string;
}

export interface FormField {
    name: string;
    label: string;
    labelPattern: number | string;
    value: string;
    element: HTMLElement;
    groupLabel: string | null;
}

export interface Template {
    [key: string]: string;
}

export interface MatchResult {
    willFill: FormField[];
    noMatchOnPage: string[];
    noValueInTemplate: FormField[];
}

export interface ScanViewModel {
    fields: FormField[];
    template: Template;
    templateText: string;
}
