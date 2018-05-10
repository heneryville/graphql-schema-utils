'use strict';

/**
 * GraphQL schema.
 * @external GraphQLSchema
 * @see {@link https://github.com/graphql/graphql-js/blob/master/src/type/schema.js}
 */

/**
 * GraphQL union type.
 * @external GraphQLUnionType
 * @see {@link https://github.com/graphql/graphql-js/blob/master/src/type/definition.js}
 */

/**
 * GraphQL object type.
 * @external GraphQLObjectType
 * @see {@link https://github.com/graphql/graphql-js/blob/master/src/type/definition.js}
 */

/**
 * GraphQL interface type.
 * @external GraphQLInterfaceType
 * @see {@link https://github.com/graphql/graphql-js/blob/master/src/type/definition.js}
 */

/**
 * GraphQL scalar type.
 * @external GraphQLScalarType
 * @see {@link https://github.com/graphql/graphql-js/blob/master/src/type/definition.js}
 */

/**
 * GraphQL enum type.
 * @external GraphQLEnumType
 * @see {@link https://github.com/graphql/graphql-js/blob/master/src/type/definition.js}
 */

/**
 * GraphQL input object type.
 * @external GraphQLInputObjectType
 * @see {@link https://github.com/graphql/graphql-js/blob/master/src/type/definition.js}
 */

const GraphQLSchema = require('graphql/type/schema').GraphQLSchema,
    GraphQLObjectType = require('graphql/type/definition').GraphQLObjectType,
    GraphQLScalarType = require('graphql/type/definition').GraphQLScalarType,
    GraphQLUnionType = require('graphql/type/definition').GraphQLUnionType,
    GraphQLEnumType = require('graphql/type/definition').GraphQLEnumType,
    GraphQLInputObjectType = require('graphql/type/definition').GraphQLInputObjectType,
    GraphQLNonNull = require('graphql/type/definition').GraphQLNonNull,
    GraphQLList = require('graphql/type/definition').GraphQLList,
    GraphQLInterfaceType = require('graphql/type/definition').GraphQLInterfaceType,
    diff = require('./lib/diff'),
    merge = require('./lib/merge');

// Diff extensions
GraphQLSchema.prototype.diff = diff.diffSchema;
GraphQLObjectType.prototype.diff = GraphQLInterfaceType.prototype.diff = GraphQLInputObjectType.prototype.diff = diff.diffObjectTypes;
GraphQLEnumType.prototype.diff = diff.diffEnumTypes;
GraphQLScalarType.prototype.diff = diff.diffScalarTypes;
GraphQLUnionType.prototype.diff = diff.diffUnionTypes;

// Merge extensions
GraphQLSchema.prototype.merge = merge.mergeSchema;
GraphQLObjectType.prototype.merge = GraphQLInterfaceType.prototype.merge = GraphQLInputObjectType.prototype.merge = merge.mergeObjectTypes;
GraphQLList.prototype.merge = GraphQLNonNull.prototype.merge = GraphQLScalarType.prototype.merge = GraphQLEnumType.prototype.merge = merge.overwriteType;
GraphQLUnionType.prototype.merge = merge.mergeUnionTypes;


