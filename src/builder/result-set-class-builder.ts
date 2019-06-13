import { SqlServerStoredProcedure } from '@yellicode/sql-server';
import { ClassDefinition, PropertyDefinition } from '@yellicode/csharp';
import { ReverseSqlObjectNameProvider, DefaultReverseSqlObjectNameProvider } from '../mapper/reverse-sql-object-name-provider';
import { SqlToCSharpTypeMapper } from '../mapper/sql-to-csharp-type-mapper';
import { ReverseSqlOptions } from './reverse-sql-options';

export class ResultSetClassBuilder {
    private objectNameProvider: ReverseSqlObjectNameProvider;

    constructor(options?: ReverseSqlOptions) {
        const opts = options || {};
        this.objectNameProvider = opts.objectNameProvider || new DefaultReverseSqlObjectNameProvider(opts.includeSchema || false);
    }

    public buildStoredProcResultSetClasses(storedProcedures: SqlServerStoredProcedure[]): ClassDefinition[] {
        // Build C# class and property definitions    
        const classDefinitions: ClassDefinition[] = [];
        storedProcedures.forEach((sp) => {
            // We only support one result set (using _describe_first_result_set)
            if (!sp.resultSets || !sp.resultSets.length)
                return;

            const classDefinition: ClassDefinition = { name: this.objectNameProvider.getResultSetClassName(sp), accessModifier: 'public', properties: [] };
            sp.resultSets[0].columns.forEach((col) => {
                const propertyName = this.objectNameProvider.getResultSetColumnPropertyName(col);

                const property: PropertyDefinition = { name: propertyName, typeName: col.objectTypeName, accessModifier: 'public' };
                property.isNullable = col.isNullable && SqlToCSharpTypeMapper.canBeNullable(col.objectTypeName);

                classDefinition.properties!.push(property);
            });
            classDefinitions.push(classDefinition);
        });

        return classDefinitions;
    }
}