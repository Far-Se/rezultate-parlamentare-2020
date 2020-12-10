const path = require('path');
const csv = require('csvtojson');
var fs = require('fs');
const {
	exit
} = require('process');

function sumObjectsByKey(...objs) {
	return objs.reduce((a, b) => {
		for (let k in b) {
			if (b.hasOwnProperty(k) && !isNaN(a[k]));
			a[k] = (a[k] || 0) + b[k];
		}
		return a;
	}, {});
}

// const ALEGERI = 'senat';
let ALEGERI = 'senat';
if (process.argv.length>2)
{
    if(!~['senat','camera_deputatilor'].indexOf(process.argv[2]))
    {
        console.log("Parametrii acceptati: senat, camera_deputatilor");
        exit(0);
    }
    ALEGERI = process.argv[2];
}
//fs.writeFileSync('data/' + ALEGERI + '.json', '{', () => {})
const culoriPartide = JSON.parse(fs.readFileSync('partide.json', 'utf8'));
const directoryPath = path.join(__dirname, 'data/' + ALEGERI);
fs.readdir(directoryPath, function(err, files) {
	if (err) {
		return console.log('Unable to scan directory: ' + err);
	}
	let i = 1;
	let finished = 0;
	var rezultateAlegeri = {};
	files.forEach(function(file) {
		csv().on('error', (err) => {
            console.log("PIZET:" + file, err);
        }).fromFile(`data/${ALEGERI}/${file}`).then((data) => {
			console.log(file);
			//console.log(data);
			//exit();
			data.forEach(results => {
				let electionResults = {};
				let countyName = "",
					uatName = "";
				try {
					if (results.hasOwnProperty('precinct_county_name')) countyName = results.precinct_county_name;
					else countyName = results.county_name;
					uatName = results.uat_name;
					countyName = countyName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
					uatName = uatName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
					countyName = countyName.replace(/(MUNICIPIUL|ORAS) /g, '');
					if (~countyName.indexOf('BUCURESTI')) countyName = 'BUCURESTI';
					uatName = uatName.replace(/(MUNICIPIUL|ORAS) /g, '');
				} catch {}
				electionResults = [];
				let electionProperties = [];
				let voturiTotal = 0;
				for (const [key, value] of Object.entries(results)) {
					if (~key.indexOf('-voturi') && value > 1) {
						let info = key.replace('-voturi', '');
						info = info.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
						// electionResults.push({
						// 	"partid": info,
						// 	"voturi": 1 * value,
						// });
						electionResults[info] = ~~value;
						voturiTotal += 1 * value;
					}
				}
				// electionResults['voturiNumarate'] = voturiTotal;
				// electionResults['totalVoturi'] = ~~results.b;
				if (!rezultateAlegeri.hasOwnProperty(countyName)) rezultateAlegeri[countyName] = {
					[uatName]: electionResults
				};
				else rezultateAlegeri[countyName][uatName] = sumObjectsByKey(rezultateAlegeri[countyName][uatName], electionResults);
			});
			// console.log(rezultateAlegeri);
			// while(1){}
		}).then(() => {
			finished++;
		})
	});
	let e = setInterval(() => {
			if (finished == files.length) {
				finished++;

				//fs.writeFileSync('data/' + ALEGERI + '.json', '}', () => {})
				fs.writeFile('data/' + ALEGERI.replace('data/', '') + '.json', JSON.stringify(rezultateAlegeri, null, 4), 'utf8', () => {});
				console.log("DONE");
				clearInterval(e);
			}
		},
		1000);
});