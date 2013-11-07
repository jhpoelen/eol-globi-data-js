# eol-globi-data-js

Find out what species interacts (e.g. eats, is eaten by) with other species.  Data provided by EOL's GloBI (Global Biotic Interactions): http://github.com/jhpoelen/eol-globi-data/wiki .

# example
If you'd like to see more that the samples below, please see test/ and example/ directories.

```javascript
var consoleDiv = document.getElementById('console');

// lookup some species by some string 'sea otter'
var closeMatchCallback = function(closeMatches) {
    closeMatches.forEach(function(closeMatch){
        // log scientific names of matches
        console.log(closeMatch.scientificName);
        var p = document.createElement('p');
        p.innerHTML = 'close match for sea otter [' + closeMatch.scientificName + ']';
        consoleDiv.appendChild(p);
    });
};
globiData.findCloseTaxonMatches('sea otter', closeMatchCallback);

// find out what a sea otter (Enhydra lutris) eats. . .
var search =  {sourceTaxonScientificName: 'Enhydra lutris', interactionType: 'preysOn'};
var callback = function(interactions) {
    interactions.forEach(function(interaction) {
        var p = document.createElement('p');
        p.innerHTML = '[' + interaction.source.name  + '] preys on ['  + interaction.target.name + ']';
        consoleDiv.appendChild(p);
    });
};
globiData.findSpeciesInteractions(search, callback);

// lookup some more info (including image urls) about the sea otter
var infoCallback = function(taxonInfo) {
    var name = taxonInfo.commonName + ' (<i>' + taxonInfo.scientificName + '</i>)';
    var infoDiv = document.createElement('div');
    infoDiv.innerHTML = '<table class="image"><caption align="bottom">' + name + '</caption>'
            + '<tr><td><img src="' + taxonInfo.thumbnailURL + '"/></td></tr></table>';
    consoleDiv.appendChild(infoDiv);
};
globiData.findTaxonInfo('Enhydra lutris', infoCallback);
```

[![Build Status](https://ci.testling.com/jhpoelen/eol-globi-data-js.png)](https://ci.testling.com/jhpoelen/eol-globi-data-js)

# usage

Make sure to include eol-globi-data-js in your project / page.

## Node Package Manager (NPM)
```javascript
var globiData = require('globi-data');
```

for example node project that uses globi-data see: http://github.com/jhpoelen/eol-globi-js .

## Directly into html
 include [globi-data-dist.js](globi-data-dist.js) in your web resources and include using script tag.
```html
...
<script src="globi-data-dist.js" charset="utf-8">
...
```

For example web project, see github repository http://github.com/eol-globi/eol-globi.github.io that is deployed using github pages here: http://eol-globi.github.io .
# methods


## globiData.findInteractionTypes(callback)
Returns available interaction types.

## globiData.findSpeciesInteractions(searchOptions, callback)
Provides a list of interactions to callback specific to search options.  Possible search options are:

 1. sourceTaxonScientificName

 2. targetTaxonScientificName

 3. interactionType

 4. lat / lng: latitude, longitude of interactions.

 5. nw_lat, nw_lng, se_lat, se_lng: spatial rectangle specified by north west and south east positions:

 ```
 nw(lat,lng) ------  ne
 |                    |
 |                    |
 sw ----------------se(lat,lng)
 ```

 an example of search options, where we'd like to find the prey of Hardhead Catfish _(Ariopsis felis)_ in a specific area:
 ```javascript
 options = {sourceTaxonScientificName: 'Ariopsis felis',
            interactionType: 'preysOn',
            nw_lat:30.52, nw_lng:-99.51, se_lat: 20.52, se_lng:-82.75}

 ```

 or example of search options, where we'd like to find which Arthropods _(Arthropoda)_ of Hardhead Catfish _(Ariopsis felis)_ in a specific area:
 ```javascript
  options = {sourceTaxonScientificName: 'Ariopsis felis',
               targetTaxonScientificName: 'Arthropoda'
             interactionType: 'preysOn',
             nw_lat:30.52, nw_lng:-99.51, se_lat: 20.52, se_lng:-82.75}

  ```

 example of returned interactions: two interactions where Hardhead Catfish _(Ariopsis felis)_ eats Chordates _(Chordata)_ and Palaemonid Shrimps _(Palaemonidae)_:

 ```javascript
[
    {
        "source":{"name":"Ariopsis felis"},
        "target":{"name":"Chordata"},
        "type":"preysOn"
    },
    {
        "source":{"name":"Ariopsis felis"},
        "target":{"name":"Palaemonidae"},
        "type":"preysOn"
    }
]
 ```

 ## globiData.findCloseTaxonMatches(searchString, callback)
Find close taxonomic (organism, species names) matches to provided input string.

For instance, close taxonomic matches with search string ```sea ottr``` are:

```javascript
{ [{scientificName: 'Enhydra lutris',
    commonNames: [ { name: 'Seeotter', lang: 'de' },{ name: 'sea otter', lang: 'en'} ],
     path: ['Animalia', 'Chordata', 'Mammalia', 'Carnivora', 'Mustelidae', 'Enhydra', 'Enhydra lutris']},
   ...]
```

## globiData.findSources(callback)
Find the sources that contributed one or more studies.  Result is a list of string.

```javascript
// example of results


```

## globiData.findStudyStats(search, callback)
Find statistics about individual studies that contributed interaction datasets to GloBI.  Optionally, you can provide a source variable in the search object to limit studies to a specific source.

```javascript
// stats for only SPIRE studies
var search = { source: 'SPIRE' }
var callback = function(statList) {
    console.log('study statistics:' + statList);
}
globi.findStudyStats(search, callback);

// stats for all studies, notice the empty search option object
globi.findStudyStats({}, callback);
```

example of information retrieved:
```javascript
[ { reference: 'Nick Fotheringham Effects of Offshore Oil Field Structures on Their Biotic Environment: Benthos and Plankton',
totalInteractions: 138,
totalSourceTaxa: 23,
totalTargetTaxa: 28 },
{ reference: 'Christian RR, Luczkovich JJ (1999) Organizing and understanding a winter\'s seagrass foodweb network through effective trophic levels. Ecol Model 117:99-124',
totalInteractions: 270,
totalSourceTaxa: 82,
totalTargetTaxa: 85 } ]
```

## globiData.findStats(search, callback)
Find statistics across all datasets.  Optionally you can limit the statistics to studies contributed by a specific source.

```javascript
// stats for only SPIRE studies
var search = { source: 'SPIRE' }
var callback = function(stats) {
    console.log('aggregate statistics:' + statList);
}
globi.findStats(search, callback);

// stats aggregated across all studies, notice the empty search option object
globi.findStats({}, callback);
```

example of resulting statistics object:
```javascript
{ numberOfStudies: 251, totalInteractions: 431842, totalSourceTaxa: 10194, totalTargetTaxa: 19477 }
```