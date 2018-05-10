'use strict';

const assert = require('assert'),
    buildSchema = require('graphql').buildSchema;

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

    describe('#merge()', function () {
        it('makes no change if merged with null schema', function (done) {
            const a = buildSchema(schema1);
            const merged = a.merge(null);

            assert.deepEqual(a.diff(merged), []);
            done();
        });

        it('makes no change if two identical schemas are merged', function (done) {
            const a = buildSchema(schema1);
            const b = buildSchema(schema1);
            const merged = a.merge(b);

            assert.deepEqual(a.diff(merged), []);
            done();
        });

        it('adds in types from other schema that don\'t exist in this schema', function (done) {
            const schema2 =
                'type Query {\n' +
                '    Video(contentId: ID!): Video\n' +
                '}\n' +
                'type Tag {\n' +
                '    type: String!\n' +
                '    value: String!\n' +
                '    displayName: String\n' +
                '}\n' +
                'interface CmsItem {\n' +
                '    contentId: ID!\n' +
                '    type: String!\n' +
                '    tags: [Tag!]\n' +
                '}\n' +
                'type Video implements CmsItem {\n' +
                '    contentId: ID!\n' +
                '    type: String!\n' +
                '    tags: [Tag!]\n' +
                '    displayName: String\n' +
                '    value: String\n' +
                '}';

            const expectedSchema =
                'type Query {\n' +
                '    Video(contentId: ID!): Video\n' +
                '    FieldOption(contentId: ID!): FieldOption\n' +
                '}\n' +
                'type Tag {\n' +
                '    type: String!\n' +
                '    value: String!\n' +
                '    displayName: String\n' +
                '}\n' +
                'interface CmsItem {\n' +
                '    contentId: ID!\n' +
                '    type: String!\n' +
                '    tags: [Tag!]\n' +
                '}\n' +
                'type FieldOption implements CmsItem {\n' +
                '    contentId: ID!\n' +
                '    type: String!\n' +
                '    tags: [Tag!]\n' +
                '    displayName: String\n' +
                '    value: String\n' +
                '}\n' +
                'type Video implements CmsItem {\n' +
                '    contentId: ID!\n' +
                '    type: String!\n' +
                '    tags: [Tag!]\n' +
                '    displayName: String\n' +
                '    value: String\n' +
                '}';

            const a = buildSchema(schema1);
            const b = buildSchema(schema2);
            const expected = buildSchema(expectedSchema);

            const merged = a.merge(b);
            assert.deepEqual(expected.diff(merged), []);
            done();
        });

        it('merges fields from types that exist in both schemas', function (done) {
            const schema2 =
                'type Query {\n' +
                '    FieldOption(contentId: ID!): FieldOption\n' +
                '}\n' +
                'type Tag {\n' +
                '    type: String!\n' +
                '    value: String!\n' +
                '    displayName: String\n' +
                '}\n' +
                'interface CmsItem {\n' +
                '    contentId: ID!\n' +
                '    type: String!\n' +
                '    tags: [Tag!]\n' +
                '}\n' +
                'type FieldOption implements CmsItem {\n' +
                '    contentId: ID!\n' +
                '    type: String!\n' +
                '    tags: [Tag!]\n' +
                '    displayName: String\n' +
                '    newValue: Int\n' +
                '}\n' +
                'input Params {\n' +
                '    contentId: ID!\n' +
                '    type: String!\n' +
                '}';

            const expectedSchema =
                'type Query {\n' +
                '    FieldOption(contentId: ID!): FieldOption\n' +
                '}\n' +
                'type Tag {\n' +
                '    type: String!\n' +
                '    value: String!\n' +
                '    displayName: String\n' +
                '}\n' +
                'interface CmsItem {\n' +
                '    contentId: ID!\n' +
                '    type: String!\n' +
                '    tags: [Tag!]\n' +
                '}\n' +
                'type FieldOption implements CmsItem {\n' +
                '    contentId: ID!\n' +
                '    type: String!\n' +
                '    tags: [Tag!]\n' +
                '    displayName: String\n' +
                '    value: String\n' +
                '    newValue: Int\n' +
                '}\n' +
                'input Params {\n' +
                '    contentId: ID!\n' +
                '    type: String!\n' +
                '}';

            const a = buildSchema(schema1);
            const b = buildSchema(schema2);
            const expected = buildSchema(expectedSchema);

            const merged = a.merge(b);
            assert.deepEqual(expected.diff(merged), []);
            done();
        });

        it('overwrites this schema\'s fields with the other schema\'s fields if they both exist', function (done) {
            const schema2 =
                'type Query {\n' +
                '    FieldOption(contentId: ID!): FieldOption\n' +
                '}\n' +
                'type Tag {\n' +
                '    type: String!\n' +
                '    value: String!\n' +
                '    displayName: String!\n' +
                '}\n' +
                'interface CmsItem {\n' +
                '    contentId: ID!\n' +
                '    type: String!\n' +
                '    tags: [Tag!]\n' +
                '}\n' +
                'type FieldOption implements CmsItem {\n' +
                '    contentId: ID!\n' +
                '    type: String!\n' +
                '    tags: [Tag!]\n' +
                '    displayName: String!\n' +
                '    value: Int\n' +
                '}';

            const expectedSchema =
                'type Query {\n' +
                '    FieldOption(contentId: ID!): FieldOption\n' +
                '}\n' +
                'type Tag {\n' +
                '    type: String!\n' +
                '    value: String!\n' +
                '    displayName: String!\n' +
                '}\n' +
                'interface CmsItem {\n' +
                '    contentId: ID!\n' +
                '    type: String!\n' +
                '    tags: [Tag!]\n' +
                '}\n' +
                'type FieldOption implements CmsItem {\n' +
                '    contentId: ID!\n' +
                '    type: String!\n' +
                '    tags: [Tag!]\n' +
                '    displayName: String!\n' +
                '    value: Int\n' +
                '}';

            const a = buildSchema(schema1);
            const b = buildSchema(schema2);
            const expected = buildSchema(expectedSchema);

            const merged = a.merge(b);
            assert.deepEqual(expected.diff(merged), []);
            done();
        });

        it('merges interfaces implemented by the same type in different schemas', function (done) {
            const schema2 =
                'type Query {\n' +
                '    FieldOption(contentId: ID!): FieldOption\n' +
                '}\n' +
                'type Tag {\n' +
                '    type: String!\n' +
                '    value: String!\n' +
                '    displayName: String\n' +
                '}\n' +
                'interface NewInterface {\n' +
                '    value: Int\n' +
                '}\n' +
                'type FieldOption implements NewInterface {\n' +
                '    displayName: String\n' +
                '    value: Int\n' +
                '}';

            const expectedSchema =
                'type Query {\n' +
                '    FieldOption(contentId: ID!): FieldOption\n' +
                '}\n' +
                'type Tag {\n' +
                '    type: String!\n' +
                '    value: String!\n' +
                '    displayName: String\n' +
                '}\n' +
                'interface CmsItem {\n' +
                '    contentId: ID!\n' +
                '    type: String!\n' +
                '    tags: [Tag!]\n' +
                '}\n' +
                'interface NewInterface {\n' +
                '    value: Int\n' +
                '}\n' +
                'type FieldOption implements CmsItem, NewInterface {\n' +
                '    contentId: ID!\n' +
                '    type: String!\n' +
                '    tags: [Tag!]\n' +
                '    displayName: String\n' +
                '    value: Int\n' +
                '}';

            const a = buildSchema(schema1);
            const b = buildSchema(schema2);
            const expected = buildSchema(expectedSchema);

            const merged = a.merge(b);
            assert.deepEqual(expected.diff(merged), []);
            done();
        });

        it('merges union types by including all types from both', function (done) {
            const schema1 =
                'type Query {\n' +
                '    Pet(name: String): Pet\n' +
                '}\n' +
                'type Cat {\n' +
                '    name: String\n' +
                '    catNip: String\n' +
                '    scratchingPost: String\n' +
                '}\n' +
                'type Fish {\n' +
                '    name: String\n' +
                '    bowl: String\n' +
                '}\n' +
                'type Dog {\n' +
                '    name: String\n' +
                '    bone: String\n' +
                '    leash: String\n' +
                '}\n' +
                'union Pet = Cat | Dog';

            const schema2 =
                'type Query {\n' +
                '    Pet(name: String): Pet\n' +
                '}\n' +
                'type Dog {\n' +
                '    name: String\n' +
                '    bone: String\n' +
                '    leash: String\n' +
                '}\n' +
                'type Fish {\n' +
                '    name: String\n' +
                '    bowl: String\n' +
                '}\n' +
                'union Pet = Dog | Fish';

            const expectedSchema =
                'type Query {\n' +
                '    Pet(name: String): Pet\n' +
                '}\n' +
                'type Cat {\n' +
                '    name: String\n' +
                '    catNip: String\n' +
                '    scratchingPost: String\n' +
                '}\n' +
                'type Dog {\n' +
                '    name: String\n' +
                '    bone: String\n' +
                '    leash: String\n' +
                '}\n' +
                'type Fish {\n' +
                '    name: String\n' +
                '    bowl: String\n' +
                '}\n' +
                'union Pet = Cat | Dog | Fish';

            const a = buildSchema(schema1);
            const b = buildSchema(schema2);
            const expected = buildSchema(expectedSchema);

            const merged = a.merge(b);
            assert.deepEqual(expected.diff(merged), []);
            done();
        });

        it('merges input object types according to same rules as regular object types', function (done) {
            const schema1 =
                'type Query {\n' +
                '    Dog(details: PetDetails): Dog\n' +
                '}\n' +
                'type Dog {\n' +
                '    name: String\n' +
                '    bone: String\n' +
                '    leash: String\n' +
                '}\n' +
                'input PetDetails {\n' +
                '    name: String\n' +
                '    weight: String\n' +
                '    location: String\n' +
                '}\n' +
                'input Params {\n' +
                '    id: ID!\n' +
                '    location: String\n' +
                '}';

            const schema2 =
                'type Query {\n' +
                '    Dog(details: PetDetails): Dog\n' +
                '}\n' +
                'type Dog {\n' +
                '    name: String\n' +
                '    bone: String\n' +
                '    leash: String\n' +
                '}\n' +
                'input PetDetails {\n' +
                '    name: String\n' +
                '    type: String\n' +
                '    weight: Int\n' +
                '}';

            const expectedSchema =
                'type Query {\n' +
                '    Dog(details: PetDetails): Dog\n' +
                '}\n' +
                'type Dog {\n' +
                '    name: String\n' +
                '    bone: String\n' +
                '    leash: String\n' +
                '}\n' +
                'input PetDetails {\n' +
                '    name: String\n' +
                '    type: String\n' +
                '    location: String\n' +
                '    weight: Int\n' +
                '}\n' +
                'input Params {\n' +
                '    id: ID!\n' +
                '    location: String\n' +
                '}';

            const a = buildSchema(schema1);
            const b = buildSchema(schema2);
            const expected = buildSchema(expectedSchema);

            const merged = a.merge(b);
            assert.deepEqual(expected.diff(merged), []);
            done();
        });
    });
});
