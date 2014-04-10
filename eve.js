var neow = require('neow');

var client = new neow.EveClient({
    keyID: '3144721',
    characterID: '455327707',
    vCode: 'DPlq6VWOvIHWDm2dGToI7POZVvVTChjOrQfpBsAtgH93zVdtfZFrRckLyCVRTXb7'
});

/*client.fetch('account:Characters')
.then(function(result){
	for(characterID in result.characters) {
	console.log(result.characters[characterID]);
	}
})
.done();*/

/*var _ref2 = client.fetch('char:CharacterSheet', {
	          characterID: 455327707 
}).then (result)
for (sklID in _ref2) {
skl = _ref2[sklID]; 
stSkill = flatSkills[sklID];
sklMultiplier = stSkill.rank.content > 1 ? " x" + stSkill.rank.content : "";
skillPointsNextLevel = neow.eve.skillpointsToLevel[Math.min(parseInt(skl.level) + 1, 5)] * stSkill.rank.content;
console.log("- " + stSkill.typeName + " " + neow.format.romanSkill[skl.level | 0] + sklMultiplier + " (" + skl.skillpoints + " / " + skillPointsNextLevel + ")");
totalSP += parseInt(skl.skillpoints);
}
return console.log("Total " + totalSP + " skillpoints.");

console.log(_ref2.race);*/
client.fetch('char:CharacterSheet')
    .then(function(result){
     for(race in result.race) {
     console.log(result.race[race])
	}
      })
//.done();
