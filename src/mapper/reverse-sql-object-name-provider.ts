import { SqlParameter, DbTable } from '../model/database';
import { SqlStoredProcedure } from '../model/sql-server-database';
import { isReservedKeyword } from '@yellicode/csharp';
import { NameUtility } from '@yellicode/core';

export interface ReverseSqlObjectNameProvider {
    /**
    * Returns the name to be generated for the specified table.
    */
    getTableClassName(table: DbTable): string;

    /**
    * Returns the name to be generated for the specified table type.
    */
    getTableTypeClassName(tableType: DbTable): string;

    /**
    * Returns the property name to be generated for a column in a table or stored procedure result set.
    */
    getColumnPropertyName(col: { name?: string, ordinal: number }): string;

    /**
     * Gets a .NET method name that is generated for inserting data into the 
     * specified table.     
     */
    getTableInsertMethodName(table: DbTable): string;

    /**
     * Gets a .NET method name that is generated for deleting data from the 
     * specified table.     
     */
    getTableDeleteMethodName(table: DbTable): string;

    /**
    * Gets a .NET method name that is generated for updating data in the 
    * specified table.     
    */
    getTableUpdateMethodName(table: DbTable): string;

    /**
     * Gets a .NET method name that is generated for selecting data from the 
     * specified table by its primary key.     
     */
    getTableSelectByPrimaryKeyMethodName(table: DbTable): string;

    /**
     * Gets a .NET method name that is generated for selecting data from the 
     * specified table using a LINQ expression.
     */
    getTableSelectByExpressionMethodName(table: DbTable): string;

    /**
    * Returns the method name to be generate for the method call to the 
    * specified stored procedure.     
    */
    getStoredProcedureMethodName(sp: SqlStoredProcedure): string;

    /**
     * Returns the name to be generated for the result set of a stored procedure.     
     */
    getStoredProcedureResultSetClassName(sp: SqlStoredProcedure): string;

    /**
     * Returns the name to be generated for the mapper class that maps
     * data records to result set classes.     
     */
    getResultSetMapperClassName(resultSetClassName: string): string;

    /**
     * Returns the .NET parameter name to be generated for the 
     * specified SQL parameter.     
     */
    getParameterName(parameter: SqlParameter): string;
}

export class DefaultReverseSqlObjectNameProvider implements ReverseSqlObjectNameProvider {
    constructor(protected includeSchema: boolean = false) {

    }


    protected static cleanup(input: string): string {
        if (!input) return '';

        // Remove non-word characters
        let result = input.replace(/[^\w]/g, '');
        return result;
    }

    public getStoredProcedureResultSetClassName(sp: SqlStoredProcedure): string {
        const cleanedUpSpName = DefaultReverseSqlObjectNameProvider.cleanup(sp.name);
        if (this.includeSchema && sp.schema && sp.schema !== 'dbo') {
            const cleanedUpSchemaName = DefaultReverseSqlObjectNameProvider.cleanup(sp.schema);
            return `${cleanedUpSchemaName}_${cleanedUpSpName}Result`;
        }
        else return `${cleanedUpSpName}Result`;
    }

    public getTableClassName(table: DbTable): string {
        const cleanedUpTableName = DefaultReverseSqlObjectNameProvider.cleanup(table.name);
        if (this.includeSchema && table.schema && table.schema !== 'dbo') {
            const cleanedUpSchemaName = DefaultReverseSqlObjectNameProvider.cleanup(table.schema);
            return `${cleanedUpSchemaName}_${cleanedUpTableName}`;
        }
        else return `${cleanedUpTableName}`;
    }

    public getTableTypeClassName(tableType: DbTable): string {
        const cleanedUpTableName = DefaultReverseSqlObjectNameProvider.cleanup(tableType.name);
        if (this.includeSchema && tableType.schema) {
            const cleanedUpSchemaName = DefaultReverseSqlObjectNameProvider.cleanup(tableType.schema);
            return `${cleanedUpSchemaName}_${cleanedUpTableName}`;
        }
        else return `${cleanedUpTableName}`;
    }

    public getResultSetMapperClassName(resultSetClassName: string): string {
        return `${resultSetClassName}Mapper`;
    }

    public getColumnPropertyName(col: { name?: string, ordinal: number }): string {
        if (!col.name) return `Column${col.ordinal}`;
        return DefaultReverseSqlObjectNameProvider.cleanup(col.name);
    }

    public getStoredProcedureMethodName(sp: SqlStoredProcedure): string {
        return this.getCleanObjectNameWithSchema(sp);
    }

    public getTableInsertMethodName(table: DbTable): string {
        // Format: "dbo_InsertMyType"
        return this.getCleanObjectNameWithSchema({ schema: table.schema, name: `Insert${NameUtility.capitalize(table.name)}` });
    }

    public getTableDeleteMethodName(table: DbTable): string {
        // Format: "dbo_DeleteMyType"
        return this.getCleanObjectNameWithSchema({ schema: table.schema, name: `Delete${NameUtility.capitalize(table.name)}` });
    }

    public getTableUpdateMethodName(table: DbTable): string {
        // Format: "dbo_UpdateMyType"
        return this.getCleanObjectNameWithSchema({ schema: table.schema, name: `Update${NameUtility.capitalize(table.name)}` });
    }

    public getTableSelectByPrimaryKeyMethodName(table: DbTable): string {
        // Format: "dbo_SelectMyType"
        return this.getCleanObjectNameWithSchema({ schema: table.schema, name: `Select${NameUtility.capitalize(table.name)}` });
    }

    public getTableSelectByExpressionMethodName(table: DbTable): string {
        // Format: "dbo_SelectMyTypeWhere"
        return this.getCleanObjectNameWithSchema({ schema: table.schema, name: `Select${NameUtility.capitalize(table.name)}Where` });
    }

    protected getCleanObjectNameWithSchema(object: { schema?: string, name: string }): string {
        let result: string;
        const cleanedUpName = DefaultReverseSqlObjectNameProvider.cleanup(object.name);
        if (this.includeSchema && object.schema && object.schema !== 'dbo') {
            const cleanedUpSchema = NameUtility.capitalize(DefaultReverseSqlObjectNameProvider.cleanup(object.schema));
            result = `${cleanedUpSchema}_${cleanedUpName}`;
        }
        else result = cleanedUpName;
        return result;
    }

    public getParameterName(parameter: SqlParameter): string {
        let name = parameter.name.startsWith('@') ? parameter.name.slice(1) : parameter.name;
        name = DefaultReverseSqlObjectNameProvider.cleanup(name);
        name = NameUtility.upperToLowerCamelCase(name);
        if (isReservedKeyword(name)) {
            name = `@${name}`;
        }
        return name;
    }
}