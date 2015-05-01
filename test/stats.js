var globiData = require('../');
var test = require('tape');


test('get data set sources', function (t) {
    t.plan(1);
    var callback = function (sources) {
        t.ok(sources.length > 0, 'should get at least one interaction');
    };
    globiData.findSources(callback);
});

test('find statistics across studies', function (t) {
    t.plan(4);
    var callback = function (stats) {
        t.ok(stats.numberOfStudies > 0, 'should have at least one study');
        t.ok(stats.numberOfDistinctSources > 1, 'should have at least two sources');
        t.ok(stats.totalInteractions > 0, 'with some interaction');
        t.ok(stats.totalTaxa > 0, 'and taxa');
    };
    globiData.findStats({}, callback);
});

test('get statistics for studies', function (t) {
    t.plan(5);
    var callback = function (statList) {
        t.ok(statList.length > 0, 'should get at least one entry');
        var stats = statList[0];
        t.ok(stats.citation, 'should have a reference');
        t.ok(stats.source, 'should have a source');
        t.ok(stats.totalInteractions > 0, 'should get at least one interaction');
        t.ok(stats.totalTaxa > 0, 'should get at least one interaction');
    };
    globiData.findStudyStats({}, callback);
});