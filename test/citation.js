var citation = require('../citation.js');
var test = require('tape');

test('get name from citation', function (t) {
  t.plan(1);
  var sourceCitation = '<https://github.com/millerse/Dapstrom-integrated-database-and-portal-for-fish-stomach-records/archive/b63289089e7cf512ddaacd14b0cad024417475ff.zip>. Accessed at <https://www.cefas.co.uk/umbraco/CefasPlugins/DapstomSurface/Download?searchType=predator&species=HER&years=2011&years=2010&years=2009&years=2006&years=2005&years=2004&years=1991&years=1981&years=1976&years=1974&years=1973&years=1972&years=1937&years=1936&years=1935&years=1934&years=1924&years=1923&years=1922&years=1921&years=1920&years=1919&years=1918&years=1917&years=1905&years=1901&years=1894&years=1893&years=1887&years=1886&years=1885&years=1884&areas=VIIg&areas=VIIj&areas=VIIa&areas=IVa&areas=IVb&areas=VIId&areas=VIa&areas=VIIe&areas=VIIf&areas=IVc&minlength=0&maxlength=1000&nullLengths=true> on 31 Dec 2016."';
  var repos = citation.extractGithubRepos(sourceCitation);
  t.deepEqual(repos, [ { name: 'millerse/Dapstrom-integrated-database-and-portal-for-fish-stomach-records' }]);
});

test('get zenodo id from citation', function (t) {
  t.plan(1);
  var sourceCitation = '"Jorrit H. Poelen. 2014. Species associations manually extracted from literature. https://doi.org/10.5281/zenodo.207958. Accessed at <https://zenodo.org/record/207958/files/globalbioticinteractions/template-dataset-0.0.2.zip> on 31 Dec 2016."';
  var repos = citation.extractZenodoDOI(sourceCitation);
  t.deepEqual(repos, [ { doi: '10.5281/zenodo.207958', name: 'globalbioticinteractions/template-dataset' }]);
});


test('extract sources from json table', function (t) {
  t.plan(2);
  var citations = citation.extractCitations(someData);
  var sources = citation.parseSourceCitations(citations);
  t.deepEqual(citations, ["<https://github.com/millerse/Dapstrom-integrated-database-and-portal-for-fish-stomach-records/archive/b63289089e7cf512ddaacd14b0cad024417475ff.zip>. Accessed at <https://www.cefas.co.uk/umbraco/CefasPlugins/DapstomSurface/Download?searchType=predator&species=HER&years=2011&years=2010&years=2009&years=2006&years=2005&years=2004&years=1991&years=1981&years=1976&years=1974&years=1973&years=1972&years=1937&years=1936&years=1935&years=1934&years=1924&years=1923&years=1922&years=1921&years=1920&years=1919&years=1918&years=1917&years=1905&years=1901&years=1894&years=1893&years=1887&years=1886&years=1885&years=1884&areas=VIIg&areas=VIIj&areas=VIIa&areas=IVa&areas=IVb&areas=VIId&areas=VIa&areas=VIIe&areas=VIIf&areas=IVc&minlength=0&maxlength=1000&nullLengths=true> on 31 Dec 2016.","<https://github.com/millerse/Dapstrom-integrated-database-and-portal-for-fish-stomach-records/archive/b63289089e7cf512ddaacd14b0cad024417475ff.zip>. Accessed at <https://www.cefas.co.uk/umbraco/CefasPlugins/DapstomSurface/Download?searchType=predator&species=CAA&years=1990&years=1977&years=1952&years=1907&years=1905&years=1903&years=1902&years=1901&years=1891&years=1890&years=1889&years=1888&years=1853&areas=IVa&areas=IVb&areas=XIVb&minlength=0&maxlength=1000&nullLengths=true> on 31 Dec 2016.","Sarah E Miller. 06/17/2015. Durden, Lance A., and Guy A. Musser. The Sucking Lice (Insecta, Anoplura) of the World : A Taxonomic Checklist with Records of Mammalian Hosts and Geographical Distributions. Bulletin of the AMNH ; No. 218. New York: American Museum of Natural History, 1994. Web.. Accessed at <https://github.com/millerse/Lice/archive/b6bca1f8de475614ee48f2d6a2cad430c0bb6436.zip> on 31 Dec 2016."]); 
  t.deepEqual(sources, [{"name":"millerse/Dapstrom-integrated-database-and-portal-for-fish-stomach-records"},{"name":"millerse/Lice"}]);
});


var someData = {
  "columns" : [ "study_citation", "study_url", "study_doi", "study_source_citation", "number_of_interactions", "number_of_distinct_taxa", "number_of_studies", "number_of_sources" ],
  "data" : [ [ null, null, null, "<https://github.com/millerse/Dapstrom-integrated-database-and-portal-for-fish-stomach-records/archive/b63289089e7cf512ddaacd14b0cad024417475ff.zip>. Accessed at <https://www.cefas.co.uk/umbraco/CefasPlugins/DapstomSurface/Download?searchType=predator&species=HER&years=2011&years=2010&years=2009&years=2006&years=2005&years=2004&years=1991&years=1981&years=1976&years=1974&years=1973&years=1972&years=1937&years=1936&years=1935&years=1934&years=1924&years=1923&years=1922&years=1921&years=1920&years=1919&years=1918&years=1917&years=1905&years=1901&years=1894&years=1893&years=1887&years=1886&years=1885&years=1884&areas=VIIg&areas=VIIj&areas=VIIa&areas=IVa&areas=IVb&areas=VIId&areas=VIa&areas=VIIe&areas=VIIf&areas=IVc&minlength=0&maxlength=1000&nullLengths=true> on 31 Dec 2016.", 5607, 165, 1, 1 ], [ null, null, null, "<https://github.com/millerse/Dapstrom-integrated-database-and-portal-for-fish-stomach-records/archive/b63289089e7cf512ddaacd14b0cad024417475ff.zip>. Accessed at <https://www.cefas.co.uk/umbraco/CefasPlugins/DapstomSurface/Download?searchType=predator&species=CAA&years=1990&years=1977&years=1952&years=1907&years=1905&years=1903&years=1902&years=1901&years=1891&years=1890&years=1889&years=1888&years=1853&areas=IVa&areas=IVb&areas=XIVb&minlength=0&maxlength=1000&nullLengths=true> on 31 Dec 2016.", 155, 42, 1, 1 ], [ null, null, null, "Sarah E Miller. 06/17/2015. Durden, Lance A., and Guy A. Musser. The Sucking Lice (Insecta, Anoplura) of the World : A Taxonomic Checklist with Records of Mammalian Hosts and Geographical Distributions. Bulletin of the AMNH ; No. 218. New York: American Museum of Natural History, 1994. Web.. Accessed at <https://github.com/millerse/Lice/archive/b6bca1f8de475614ee48f2d6a2cad430c0bb6436.zip> on 31 Dec 2016.", 4167, 971, 1, 1 ]]};
