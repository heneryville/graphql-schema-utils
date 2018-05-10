'use strict';

const assert = require('assert'),
    buildSchema = require('graphql').buildSchema,
    GraphQLDiff = require('../lib/diff/GraphQLDiff'),
    DiffType = require('../lib/diff/types');

require('../index');

const schema1 =
    'type Query {\n' +
    '	FieldOption(contentId: ID!): FieldOption\n' +
    '}\n' +
    'type Tag {\n' +
    '	type: String!\n' +
    '	value: String!\n' +
    '	displayName: String\n' +
    '}\n' +
    'interface CmsItem {\n' +
    '	contentId: ID!\n' +
    '	type: String!\n' +
    '	tags: [Tag!]\n' +
    '}\n' +
    'type FieldOption implements CmsItem {\n' +
    '	contentId: ID!\n' +
    '	type: String!\n' +
    '	tags: [Tag!]\n' +
    '	displayName: String\n' +
    '	value: String\n' +
    '}';

describe('GraphQLSchema', function () {
    describe('#diff()', function () {
        describe('synonyms', function () {

            it('reports no diffs for schemas that are same except for synonyms', function () {
              const a = buildSchema('type Query { operationA: String! }');
              const b = buildSchema('type Query { operationB: String! }');
              let diff = a.diff(b, {synonyms: [{thisType: 'Query', thisField: 'operationA', otherField: 'operationB'}]});
              assert.equal(diff.length, 0);
            });

            it('reports no diffs for types that are same except for synonyms', function () {
              const a = buildSchema('type Query { op: typeA } type typeA { a: String  }');
              const b = buildSchema('type Query { op: typeB } type typeB { a: String  }');
              let diff = a.diff(b, {synonyms: [{thisType: 'typeA', otherType: 'typeB'}]});
              assert.equal(diff.length, 0);
            });


            function diffExists(diffs, expectedDiff) {
                for (let i = 0; i < diffs.length; i++) {
                    if (diffs[i].diffType === expectedDiff.diffType && diffs[i].description === expectedDiff.description) {
                        return true;
                    }
                }
                return false;
            }
        });
    });

});
