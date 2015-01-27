var globi = require('../');
var test = require('tape');

test('mapCommonNameList with bad input', function (t) {
    t.plan(4);

    var mock1 = '';
    var mock2 = null;
    var mock3 = {};
    var mock4 = function() {};

    var result1 = globi.mapCommonNameList(mock1);
    var result2 = globi.mapCommonNameList(mock2);
    var result3 = globi.mapCommonNameList(mock3);
    var result4 = globi.mapCommonNameList(mock4);

    t.deepEqual(result1, { count: 0 });
    t.deepEqual(result2, { count: 0 });
    t.deepEqual(result3, { count: 0 });
    t.deepEqual(result4, { count: 0 });
});

test('mapCommonNameList with standard format', function (t) {
    t.plan(4);

    var mock1 = 'foo @en | bar @de';
    var mock2 = 'foo @en';
    var result1 = globi.mapCommonNameList(mock1);
    var result2 = globi.mapCommonNameList(mock2);

    t.equal(typeof result1, 'object');
    t.deepEqual(result1, { count: 2, en: 'foo', de: 'bar' });

    t.equal(typeof result2, 'object');
    t.deepEqual(result2, { count: 1, en: 'foo' });
});

test('mapCommonNameList with trailing signs', function (t) {
    t.plan(6);

    var mock1 = 'foo @en | bar @de ';
    var mock2 = 'foo @en | bar @de |';
    var mock3 = 'foo @en | bar @de | ';
    var result1 = globi.mapCommonNameList(mock1);
    var result2 = globi.mapCommonNameList(mock2);
    var result3 = globi.mapCommonNameList(mock3);

    t.equal(typeof result1, 'object');
    t.deepEqual(result1, { count: 2, en: 'foo', de: 'bar' });

    t.equal(typeof result2, 'object');
    t.deepEqual(result2, { count: 2, en: 'foo', de: 'bar' });

    t.equal(typeof result3, 'object');
    t.deepEqual(result3, { count: 2, en: 'foo', de: 'bar' });
});

test('mapCommonNameList heading signs', function (t) {
    t.plan(6);

    var mock1 = ' foo @en | bar @de';
    var mock2 = '| foo @en | bar @de';
    var mock3 = ' | foo @en | bar @de';
    var result1 = globi.mapCommonNameList(mock1);
    var result2 = globi.mapCommonNameList(mock2);
    var result3 = globi.mapCommonNameList(mock3);

    t.equal(typeof result1, 'object');
    t.deepEqual(result1, { count: 2, en: 'foo', de: 'bar' });

    t.equal(typeof result2, 'object');
    t.deepEqual(result2, { count: 2, en: 'foo', de: 'bar' });

    t.equal(typeof result3, 'object');
    t.deepEqual(result3, { count: 2, en: 'foo', de: 'bar' });
});

test('mapCommonNameList override', function (t) {
    t.plan(3);

    var mock = ' foo @en | bar @de | baz @en';

    var result1 = globi.mapCommonNameList(mock);
    var result2 = globi.mapCommonNameList(mock, true);
    var result3 = globi.mapCommonNameList(mock, false);

    t.deepEqual(result1, { count: 2, en: 'baz', de: 'bar' });
    t.deepEqual(result2, { count: 2, en: 'baz', de: 'bar' });
    t.deepEqual(result3, { count: 2, en: 'foo', de: 'bar' });
});