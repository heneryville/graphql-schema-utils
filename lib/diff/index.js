'use strict';

const GraphQLSchema = require('graphql/type/schema').GraphQLSchema,
    GraphQLObjectType = require('graphql/type/definition').GraphQLObjectType,
    GraphQLScalarType = require('graphql/type/definition').GraphQLScalarType,
    GraphQLUnionType = require('graphql/type/definition').GraphQLUnionType,
    GraphQLEnumType = require('graphql/type/definition').GraphQLEnumType,
    GraphQLInputObjectType = require('graphql/type/definition').GraphQLInputObjectType,
    GraphQLNonNull = require('graphql/type/definition').GraphQLNonNull,
    GraphQLList = require('graphql/type/definition').GraphQLList,
    GraphQLInterfaceType = require('graphql/type/definition').GraphQLInterfaceType,
    GraphQLDiff = require('./GraphQLDiff'),
    DiffType = require('./types'),
    { dedupe, format } = require('../utils');

const labelForThisSchema = 'this schema',
    labelForOtherSchema = 'other schema',
    labelForThisType = 'this type',
    labelForOtherType = 'other type';

/**
 * Reports differences between this GraphQLSchema and another one by diffing all of the types.
 * @param {GraphQLSchema} other - another GraphQLSchema
 * @param {Object} [options] - optional properties to modify the behavior of the diff operation
 * @param {String} [options.labelForThis="this schema"] - specifies a custom name to refer to the schema on which .diff(...) was called.
 * @param {String} [options.labelForOther="other schema"] - specifies a custom name to refer to the schema against which this schema is being diffed.
 * @returns {GraphQLDiff[]} array of differences between the schemas
 * @function external:GraphQLSchema#diff
 */
function diffSchema(other, options) {
    options = setDefaultDiffOptions.call(this, options);
    let diffs = [];
    if (!other || !(other instanceof GraphQLSchema)) {
        throw new TypeError('Cannot diff with null/undefined or non-GraphQLSchema object.');
    }

    for (let key in this.getTypeMap()) {
        const thisType = this.getTypeMap()[key];
        const otherType = other.getTypeMap()[key];
        diffs = diffs.concat(thisType.diff(otherType, options));
    }
    for (let key in other.getTypeMap()) {
        const thisType = this.getTypeMap()[key];
        if (!thisType) {
            const description = format('Type missing from {0}: `{1}`.', options.labelForThis, key);
            const diff = new GraphQLDiff(thisType, other.getTypeMap()[key], DiffType.TypeMissing, description, true);
            diffs.push(diff);
        }
    }
    return diffs;
}

/**
 * Reports differences between this GraphQLScalarType and another.
 * @param {GraphQLScalarType} other - another GraphQLScalarType
 * @param {Object} [options] - optional properties to modify the behavior of the diff operation
 * @param {String} [options.labelForThis="this type"] - specifies a custom name to refer to the object on which .diff(...) was called.
 * @param {String} [options.labelForOther="other type"] - specifies a custom name to refer to the object against which this object is being diffed.
 * @returns {GraphQLDiff[]} array of differences
 * @function external:GraphQLScalarType#diff
 */
function diffScalarTypes(other, options) {
    options = setDefaultDiffOptions.call(this, options);
    let commonDiffs = commonTypeDiffs.call(this, other, options);
    if (commonDiffs) {
        return commonDiffs;
    }
    if (this.description !== other.description) {
        const description = format('Description diff on type {0}. {1}: `"{2}"` vs. {3}: `"{4}"`.', this.name, options.labelForThis, this.description, options.labelForOther, other.description);
        return [new GraphQLDiff(this, other, DiffType.TypeDescriptionDiff, description, true)];
    }
    return [];
}

/**
 * Reports differences between this GraphQLEnumType and another. The name and enum values are compared.
 * @param {GraphQLEnumType} other - another GraphQLEnumType
 * @param {Object} [options] - optional properties to modify the behavior of the diff operation
 * @param {String} [options.labelForThis="this type"] - specifies a custom name to refer to the object on which .diff(...) was called.
 * @param {String} [options.labelForOther="other type"] - specifies a custom name to refer to the object against which this object is being diffed.
 * @returns {GraphQLDiff[]} array of differences
 * @function external:GraphQLEnumType#diff
 */
function diffEnumTypes(other, options) {
    options = setDefaultDiffOptions.call(this, options);
    let commonDiffs = commonTypeDiffs.call(this, other, options);
    if (commonDiffs) {
        return commonDiffs;
    }
    let diffs = [];
    let thisEnumValues = this.getValues();
    let otherEnumValues = other.getValues();
    let thisEnumValuesMap = new Map();
    let otherEnumValuesMap = new Map();
    for (let i = 0; i < thisEnumValues.length; i ++) {
        thisEnumValuesMap.set(thisEnumValues[i].name, thisEnumValues[i]);
    }
    for (let i = 0; i < otherEnumValues.length; i++) {
        otherEnumValuesMap.set(otherEnumValues[i].name, otherEnumValues[i]);
    }
    diffs = diffs.concat(diffEnumValues(thisEnumValuesMap, otherEnumValuesMap, this, other, options));
    if (this.description !== other.description) {
        const description = format('Description diff on type {0}. {1}: `"{2}"` vs. {3}: `"{4}"`.', this.name, options.labelForThis, this.description, options.labelForOther, other.description);
        diffs.push(new GraphQLDiff(this, other, DiffType.TypeDescriptionDiff, description, true));
    }
    return dedupe(diffs);
}

/**
 * Reports differences between this GraphQLUnionType and another GraphQLUnionType.
 * @param {GraphQLUnionType} other - another GraphQLUnionType
 * @param {Object} [options] - optional properties to modify the behavior of the diff operation
 * @param {String} [options.labelForThis="this type"] - specifies a custom name to refer to the object on which .diff(...) was called.
 * @param {String} [options.labelForOther="other type"] - specifies a custom name to refer to the object against which this object is being diffed.
 * @returns {GraphQLDiff[]} array of differences
 * @function external:GraphQLUnionType#diff
 */
function diffUnionTypes(other, options) {
    options = setDefaultDiffOptions.call(this, options);
    let commonDiffs = commonTypeDiffs.call(this, other, options);
    if (commonDiffs) {
        return commonDiffs;
    }
    let diffs = [];
    if (this.description !== other.description) {
        const description = format('Description diff on type {0}. {1}: `"{2}"` vs. {3}: `"{4}"`.', this.name, options.labelForThis, this.description, options.labelForOther, other.description);
        diffs.push(new GraphQLDiff(this, other, DiffType.TypeDescriptionDiff, description, true));
    }
    const thisType = this.getTypes().map(function (type) {
        return type.name;
    }).sort().join(' | ');
    const otherType = other.getTypes().map(function (type) {
        return type.name;
    }).sort().join(' | ');

    if (thisType !== otherType) {
        const description = format('Difference in union type {0}. {1}: `{2}` vs. {3}: `{4}`.', this.name, options.labelForThis, thisType, options.labelForOther, otherType);
        diffs.push(new GraphQLDiff(this, other, DiffType.UnionTypeDiff, description, true));
    }
    return diffs;
}

/**
 * Reports differences between this GraphQLObjectType, GraphQLInterfaceType, or GraphQLInputObjectType and another. Fields and implemented interfaces are compared.
 * @param {GraphQLObjectType|GraphQLInterfaceType|GraphQLInputObjectType} other - another GraphQLObjectType, GraphQLInterfaceType, or GraphQLInputObjectType
 * @param {Object} [options] - optional properties to modify the behavior of the diff operation
 * @param {String} [options.labelForThis="this type"] - specifies a custom name to refer to the object on which .diff(...) was called.
 * @param {String} [options.labelForOther="other type"] - specifies a custom name to refer to the object against which this object is being diffed.
 * @returns {GraphQLDiff[]} array of differences
 * @function external:GraphQLObjectType#diff
 * @function external:GraphQLInterfaceType#diff
 * @function external:GraphQLInputObjectType#diff
 */
function diffObjectTypes(other, options) {
    options = setDefaultDiffOptions.call(this, options);
    let commonDiffs = commonTypeDiffs.call(this, other, options);
    if (commonDiffs) {
        return commonDiffs;
    }
    let diffs = diffFields(this, other, options);
    if (this.description !== other.description) {
        const description = format('Description diff on type {0}. {1}: `"{2}"` vs. {3}: `"{4}"`.', this.name, options.labelForThis, this.description, options.labelForOther, other.description);
        diffs.push(new GraphQLDiff(this, other, DiffType.TypeDescriptionDiff, description, true));
    }
    if (this instanceof GraphQLObjectType) {
        diffs = diffs.concat(diffInterfaces(this, other, options)).concat(diffInterfaces(other, this, options));
    }
    return diffs;
}

function diffFields(thisType, otherType, options) {
    let diffs = [];
    for (let key of Object.keys(thisType.getFields())) {
        const thisField = thisType.getFields()[key];
        const otherField = otherType.getFields()[key];
        if (!otherField) {
            const description = format('Field missing from {0}: `{1}.{2}`.', options.labelForOther, thisType.name, getFieldString(thisField));
            diffs.push(new GraphQLDiff(thisType, otherType, DiffType.FieldMissing, description, false));
            continue;
        }
        const thisTypeName = getFieldTypeName(thisField);
        const otherTypeName = getFieldTypeName(otherField);
        if (thisTypeName !== otherTypeName) {
            const description = format('Field type changed on field {0}.{1} from : `"{2}"` to `"{3}"`.', thisType, thisField.name, thisTypeName, otherTypeName);
            diffs.push(new GraphQLDiff(thisType, otherType, DiffType.FieldDiff, description, false));
        }
        if (thisField.description !== otherField.description) {
            const description = format('Description diff on field {0}.{1}. {2}: `"{3}"` vs. {4}: `"{5}"`.', thisType.name, key, options.labelForThis, thisField.description, options.labelForOther, otherField.description)
            diffs.push(new GraphQLDiff(thisType, otherType, DiffType.FieldDescriptionDiff, description, true));
        }
        diffs = diffs.concat(diffArguments(thisType, otherType, thisField, otherField, options));
        diffs = diffs.concat(diffArgDescriptions(thisType, otherType, thisField, otherField, options));
    }
    for (let key of Object.keys(otherType.getFields())) {
        const thisField = thisType.getFields()[key];
        const otherField = otherType.getFields()[key];
        if (!thisField) {
            const description = format('Field missing from {0}: `{1}.{2}`.', options.labelForThis, thisType.name, getFieldString(otherField));
            diffs.push(new GraphQLDiff(thisType, otherType, DiffType.FieldMissing, description, true));
        }
    }
    return diffs;
}

function diffArgDescriptions(thisType, otherType, thisField, otherField, options) {
    if (!thisField.args || !otherField.args) {
        return [];
    }
    const thisArgs = new Map(thisField.args.map(function (arg) {
        return [arg.name, arg];
    }));
    return otherField.args.map(function (arg) {
        if (thisArgs.has(arg.name)) {
            const thisDescription = thisArgs.get(arg.name).description;
            const otherDescription = arg.description;
            if (thisDescription !== otherDescription) {
                const description = format('Description diff on argument {0}.{1}({2}). {3}: `"{4}"` vs. {5}: `"{6}"`.', thisType.name, thisField.name, arg.name, options.labelForThis, thisDescription, options.labelForOther, otherDescription);
                const diff = new GraphQLDiff(thisType, otherType, DiffType.ArgDescriptionDiff, description, true);
                diff.thisField = thisField;
                diff.otherField = otherField;
                return diff;
            }
        }
        return null;
    }).filter(function (str) {
        return !!str;
    });
}
function diffArguments(thisType, otherType, thisField, otherField, options) {
    const diffs = [];
    if (!thisField.args || !otherField.args) {
        return [];
    }
    let oldArgsMap = getArgumentMap(thisField.args);
    let newArgsMap = getArgumentMap(otherField.args);
    oldArgsMap.forEach(function(value, key) {
        if (!newArgsMap.has(key)) {
            const description = format('Argument missing from {0}: `{1}.{2}({3}: {4})`.', options.labelForOther, thisType, thisField.name, key, value);
            diffs.push(new GraphQLDiff(thisType, otherType, DiffType.ArgDiff, description, false));
        } else if (newArgsMap.get(key) !== value) {
            const description = format('Argument type diff on field {0}.{1}. {2}: `{3}: {4}` vs. {5}: `{6}: {7}.`', thisType, thisField.name, options.labelForThis, key, value, options.labelForOther, key, newArgsMap.get(key));
            diffs.push(new GraphQLDiff(thisType, otherType, DiffType.ArgDiff, description, false));
        }
    });
    newArgsMap.forEach(function(value, key) {
       if (!oldArgsMap.has(key)) {
           const description = format('Argument missing from {0}: `{1}.{2}({3}: {4})`.', options.labelForThis, otherType, otherField.name, key, value);
           diffs.push(new GraphQLDiff(thisType, otherType, DiffType.ArgDiff, description, true));
       }
    });
    return diffs;
}

function diffInterfaces(thisType, otherType, options) {
    if (!interfacesEqual(thisType, otherType) || !interfacesEqual(otherType, thisType)) {
        const description = format('Interface diff on type {0}. {1}: `{2}` vs. {3}: `{4}`.', thisType.name, options.labelForThis, thisType.getInterfaces().join(', '), options.labelForOther, otherType.getInterfaces().join(', '));
        return [new GraphQLDiff(thisType, otherType, DiffType.InterfaceDiff, description, false)];
    }
    return [];
}

function interfacesEqual(thisType, otherType) {
    let match = true;
    for (let i = 0; i < thisType.getInterfaces().length; i++) {
        match = otherType.getInterfaces().some(function (item) {
                return item.name === thisType.getInterfaces()[i].name;
            }
        );
        if (!match) {
            break;
        }
    }
    return match;
}
function diffEnumValues(thisVals, otherVals, thisType, otherType, options) {
    const diffs = [];
    thisVals.forEach(function(value, key) {
        if (!otherVals.get(key)) {
            const description = format('Enum value missing from {0}: `"{1}.{2}"`.', options.labelForOther, otherType.name, thisVals.get(key).name);
            diffs.push(new GraphQLDiff(thisType, otherType, DiffType.EnumDiff, description, false));
        } else {
            if (value.description !== otherVals.get(key).description) {
                const description = format('Description diff on enum value {0}.{1}. {2}: `"{3}"` vs. {4}: `"{5}"`.', thisType.name, thisVals.get(key).name, options.labelForThis, thisVals.get(key).description, options.labelForOther, otherVals.get(key).description);
                diffs.push(new GraphQLDiff(thisType, otherType, DiffType.EnumDiff, description, true));
            }
            const deprecationStatus1 = getDeprecationStatus(thisVals.get(key));
            const deprecationStatus2 = getDeprecationStatus(otherVals.get(key));
            if (deprecationStatus1 !== deprecationStatus2) {
                const description = format('Deprecation diff on enum value {0}.{1}. {2}: `{3}` vs. {4}: `"{5}"`.', thisType.name, thisVals.get(key).name, options.labelForThis, deprecationStatus1, options.labelForOther, deprecationStatus2)
                diffs.push(new GraphQLDiff(thisType, otherType, DiffType.EnumDiff, description, true));
            }
        }
    });
    otherVals.forEach(function(value, key){
        if (!thisVals.get(key)) {
            const description = format('Enum value missing from {0}: `"{1}.{2}"`.', options.labelForThis, otherType.name, otherVals.get(key).name);
            diffs.push(new GraphQLDiff(thisType, otherType, DiffType.EnumDiff, description, true));
        }
    });
    return diffs;
}

/**
 * @param {Map} list of field arguments
 * @returns {Map} mapping of argument name to field type name
 */
function getArgumentMap(fieldArguments) {
    let argumentMap = new Map();
    if (fieldArguments) {
        for (let j = 0; j < fieldArguments.length; j++) {
            const fieldTypeName = getFieldTypeName(fieldArguments[j]);
            argumentMap.set(fieldArguments[j].name, fieldTypeName);
        }
    }
    return argumentMap;
}

/**
 * Returns the field type name. Appends "!" to non null field types. Appends "[ ]" to list field types
 * @param field
 * @returns {String} field name
 */
function getFieldTypeName(field) {
    return buildTypeString(field.type)
}

function buildTypeString(type) {
    if (type instanceof GraphQLNonNull) {
        return buildTypeString(type.ofType) + "!";
    } else if (type instanceof GraphQLList) {
        return "[" + buildTypeString(type.ofType) + "]";
    } else {
        return type.name;
    }
}

function getDeprecationStatus(val) {
    if (val.isDeprecated) {
        return 'is deprecated (' + val.deprecationReason + ')';
    }
    return 'is not deprecated';
}

function commonTypeDiffs(other, options) {
    if (!other) {
        const description = format('Type missing from {0}: `{1}`.', options.labelForOther, this.name);
        return [new GraphQLDiff(this, other, DiffType.TypeMissing, description, false)];
    }
    if (this.constructor.name !== other.constructor.name) {
        const description = format('Type mismatch: {0}: `{1}: {2}` vs. {3}: `{4}: {5}`.', options.labelForThis, this.name, this.constructor.name, options.labelForOther, other.name, other.constructor.name);
        return [new GraphQLDiff(this, other, DiffType.BaseTypeDiff, description, true)];
    }
    if (this.name !== other.name) {
        const description = format('Type name difference. {0}: `{1}` vs. {2}: `{3}`.', options.labelForThis, this.name, options.labelForOther, other.name);
        return [new GraphQLDiff(this, other, DiffType.TypeNameDiff, description, true)];
    }
    return null;
}

function getFieldString(field) {
    return field.name + getArgsString(field) + ': ' + field.type.toString();
}

function getArgsString(field) {
    if (!field.args || !field.args.length) {
        return '';
    }
    return '(' + field.args.map(function (arg) {
            const defaultVal = arg.defaultValue ? ' = ' + arg.defaultValue : '';
            return arg.name + ': ' + arg.type.toString() + defaultVal;
        }).join(', ') + ')';
}

function setDefaultDiffOptions(options) {
    options = options || {};
    options.labelForThis = options.labelForThis || (this instanceof GraphQLSchema ? labelForThisSchema : labelForThisType);
    options.labelForOther = options.labelForOther || (this instanceof GraphQLSchema ? labelForOtherSchema : labelForOtherType);
    return options;
}

module.exports = {
    diffSchema,
    diffObjectTypes,
    diffEnumTypes,
    diffScalarTypes,
    diffUnionTypes
};
