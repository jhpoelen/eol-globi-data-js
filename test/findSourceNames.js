var globiData = require('../');
var test = require('tape');

test('find names', function (t) {
  t.plan(3);
  globiData.findSourceNames(function(sourceNames) {
    t.ok(sourceNames.length > 0);
    var sourceNamesWithName = sourceNames.filter(function(name) { return name.name !== undefined; });
    t.equal(sourceNames.length, sourceNamesWithName.length);
    var sourceNamesWithDoi = sourceNames.filter(function(name) { return name.doi !== undefined; });
    t.ok(sourceNamesWithDoi.length > 0);
  });

});
