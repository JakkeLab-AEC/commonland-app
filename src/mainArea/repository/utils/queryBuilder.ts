export class RepositryQueryBuilder {
    static buildInsertQuery(tableName: string, columnNames: string[]) {
        const parameterField = columnNames.map(() => '?').join(', ');
        return `INSERT INTO ${tableName} (${columnNames.join(', ')}) VALUES (${parameterField})`;
    }
    
    static buildUpdateQuery(tableName: string, columnNames: string[], idColumn: string) {
        const parameters = columnNames.map(col => `${col}`).join(', ');
        const parameterInputs = [];
        for(let i = 0; i < columnNames.length; i++) {
            parameterInputs.push('?');
        }
        return `
            UPDATE 
                ${tableName} 
            SET 
                (${parameters}) = (${parameterInputs.join(', ')})
            WHERE 
                ${idColumn} = ?`;
    }
}