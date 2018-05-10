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
    cloneDeep = require('lodash.clonedeep');
/**
 * Merge this GraphQLSchema with another one. This schema's types and fields take precedence over other's.
 * Does not modify either schema, but instead returns a new one.
 * @param {GraphQLSchema} other another GraphQLSchema to merge with this one
 * @returns {GraphQLSchema} new GraphQLSchema representing this merged with other
 * @function external:GraphQLSchema#merge
 */
function mergeSchema(other) {
    const merged = cloneDeep(this);
    if (!other) {
        return merged;
    }
    if (!(other instanceof GraphQLSchema)) {
        throw new TypeError('Cannot merge with null/undefined or non-GraphQLSchema object.');
    }
    for (let key in this.getTypeMap()) {
        const thisType = this.getTypeMap()[key];
        const otherType = other.getTypeMap()[key];
        merged._typeMap[key] = thisType.merge(otherType);
    }
    for (let key in other.getTypeMap()) {
        const thisType = this.getTypeMap()[key];
        const otherType = other.getTypeMap()[key];
        if (!thisType) {
            merged._typeMap[key] = otherType;
        }
    }
    return merged;
}

/**
 * Merges a type by simply overwriting this type with other if it exists.
 * @param {GraphQLList|GraphQLNonNull|GraphQLScalarType|GraphQLEnumType} other - another GraphQL type object to merge with this
 * @returns {GraphQLList|GraphQLNonNull|GraphQLScalarType|GraphQLEnumType} other if it exists, otherwise this.
 * @function external:GraphQLScalarType#merge
 * @function external:GraphQLNonNull#merge
 * @function external:GraphQLEnumType#merge
 */
function overwriteType(other) {
    return other || this;
}

/**
 * Merges another GraphQLObjectType or GraphQLInterfaceType with this one by taking the union of all fields in both types, overwriting this type's
 * fields with the other's if there are conflicts. For GraphQLObjectTypes, implemented interfaces are also merged.
 * @param other - another GraphQL type to merge with this one
 * @returns {GraphQLObjectType|GraphQLInterfaceType|GraphQLInputObjectType} a new graphql type resulting from merging `this` and `other`
 * @function external:GraphQLObjectType#merge
 * @function external:GraphQLInterfaceType#merge
 * @function external:GraphQLInputObjectType#merge
 */
function mergeObjectTypes(other) {
    const mergedType = cloneDeep(this);
    if (!other) {
        return mergedType;
    }
    if (this.constructor.name !== other.constructor.name) {
        throw new TypeError(format('Cannot merge with different base type. this: {0}, other: {0}.', this.constructor.name, other.constructor.name));
    }

    // Set mergedType._fields if it hasn't been set yet
    if (!mergedType._fields) {
        mergedType.getFields();
    }

    Object.keys(other.getFields()).forEach(key => {
        mergedType._fields[key] = other.getFields()[key];
    });

    if (this instanceof GraphQLObjectType) {
        mergedType._interfaces = Array.from(new Set(this.getInterfaces().concat(other.getInterfaces())));
    }
    return mergedType;
}

/**
 * Merges this GraphQLUnionType with another GraphQLUnionType by taking the union of the types included in both.
 * @param other - another GraphQLUnionType to merge with this one
 * @returns {GraphQLUnionType} a new GraphQLUnionType resulting from merging `this` and `other`
 * @function external:GraphQLUnionType#merge
 */
function mergeUnionTypes(other) {
    const mergedType = cloneDeep(this);
    if (!other) {
        return mergedType;
    }
    if (this.constructor.name !== other.constructor.name) {
        throw new TypeError(format('Cannot merge with different base type. this: {0}, other: {0}.', this.constructor.name, other.constructor.name));
    }
    const thisTypes = new Map(this.getTypes().map(type => [type.name, true]));
    mergedType._types = mergedType._types.concat(other.getTypes().filter(type => !thisTypes.get(type.name)));
    return mergedType;
}

module.exports = {
  mergeSchema,
  mergeObjectTypes,
  overwriteType,
  mergeUnionTypes
};
