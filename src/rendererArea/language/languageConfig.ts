export type LocaleCodes = 'en'|'kr'|'jp';

export interface LanguageDisplayItem {
    componentName: string,
    localeCode: LocaleCodes,
    itemName: string;
    displayString: string;
}

export interface LanguageConfig {
    localeCode: LocaleCodes,
    displayStrings: Map<string, LanguageDisplayItem>
}

export const displayStringsGlobal: Map<string, LanguageDisplayItem> = new Map([
    // Boring editor page
    ['BoringManager-pageHeader-kr', {componentName: 'BoringEditor', localeCode:'kr', itemName:'pageHeader', displayString: '시추공 편집'}],
    ['BoringManager-pageHeader-en', {componentName: 'BoringEditor', localeCode:'en', itemName:'pageHeader', displayString: 'Boring Manager'}],
    ['BoringManager-pageHeader-jp', {componentName: 'BoringEditor', localeCode:'jp', itemName:'pageHeader', displayString: 'ボアホール編集'}],

    ['BoringManager-boringList-kr', {componentName: 'BoringEditor', localeCode:'kr', itemName:'boringList', displayString: '시추공 리스트'}],
    ['BoringManager-boringList-en', {componentName: 'BoringEditor', localeCode:'en', itemName:'boringList', displayString: 'Boring List'}],

    ['BoringManager-boringListBoxHeader-kr', {componentName: 'BoringEditor', localeCode:'kr', itemName:'boringListBoxHeader', displayString: '이름'}],
    
    ['BoringEditor-editorHeaderNew-kr', {componentName: 'BoringEditor', localeCode:'kr', itemName:'editorHeaderNew', displayString: '시추공 생성'}],
    ['BoringEditor-editorHeaderEdit-kr', {componentName: 'BoringEditor', localeCode:'kr', itemName:'editorHeaderEdit', displayString: '시추공 편집'}],
    
    ['BoringEditor-boringNameHeader-kr', {componentName: 'BoringEditor', localeCode:'kr', itemName:'boringNameHeader', displayString: '시추공 이름'}],

    ['BoringEditor-boringCoordinate-kr', {componentName: 'BoringEditor', localeCode:'kr', itemName:'boringCoordinate', displayString: '좌표'}],
    
    ['BoringEditor-boringLevels-kr', {componentName: 'BoringEditor', localeCode:'kr', itemName:'boringLevels', displayString: '레벨'}],
    
    ['BoringEditor-elevation-kr', {componentName: 'BoringEditor', localeCode:'kr', itemName:'elevation', displayString: '지반표고'}],
    
    ['BoringEditor-undergroundwater-kr', {componentName: 'BoringEditor', localeCode:'kr', itemName:'undergroundwater', displayString: '지하수위'}],
    
    ['BoringPreviewer-windowtitle-kr', {componentName: 'BoringPreviewer', localeCode:'kr', itemName:'windowtitle', displayString: '시추공 미리보기'}],
]);