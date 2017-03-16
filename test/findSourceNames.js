var globiData = require('../');
var test = require('tape');

test('find names', function (t) {
    t.plan(4);
    globiData.findSourceNames(function (sourceNames) {
        t.ok(sourceNames.length > 0);
        var sourceNamesWithName = sourceNames.filter(function (name) {
            return name.name !== undefined;
        });
        t.equal(sourceNames.length, sourceNamesWithName.length);
        var sourceNamesWithDoi = sourceNames.filter(function (name) {
            return name.doi !== undefined;
        });
        t.ok(sourceNamesWithDoi.length > 0);
        var sourceNamesAll = sourceNames.map(function (name) {
            return name.name;
        });
        var sourceNamesUniq = sourceNamesAll.sort().filter(function (name, i) {
            var of = sourceNamesAll.indexOf(name);
            return of === i;
        });

        t.equal(sourceNames.length, sourceNamesUniq.length);
    });

});
