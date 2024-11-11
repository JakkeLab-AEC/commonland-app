export class UnicodeConverter {
    private static isKoreanChar(char: string): boolean {
        if(char.length !== 1) {
            throw new Error("Input must be a single character.");
        }
        const code = char.charCodeAt(0);
        return 0xAC00 <= code && code <= 0xD7A3;
    }

    static convertStringToUnicode(str: string): string {
        return Array.from(str)
            .map(char => (this.isKoreanChar(char) ? `\\U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}` : char))
            .join('');
    }
}