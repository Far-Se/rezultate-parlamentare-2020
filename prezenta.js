const counties = {
	"AB": "Alba",
	"AR": "Arad",
	"AG": "Argeş",
	"BC": "Bacău",
	"BH": "Bihor",
	"BN": "Bistriţa-năsăud",
	"BT": "Botoşani",
	"BR": "Brăila",
	"BV": "Braşov",
	"BZ": "Buzău",
	"CL": "Călăraşi",
	"CS": "Caraş-severin",
	"CJ": "Cluj",
	"CT": "Constanţa",
	"CV": "Covasna",
	"DB": "Dâmboviţa",
	"DJ": "Dolj",
	"GL": "Galaţi",
	"GR": "Giurgiu",
	"GJ": "Gorj",
	"HR": "Harghita",
	"HD": "Hunedoara",
	"IL": "Ialomiţa",
	"IS": "Iaşi",
	"IF": "Ilfov",
	"MM": "Maramureş",
	"MH": "Mehedinţi",
	"B": "Municipiul bucureşti",
	"MS": "Mureş",
	"NT": "Neamţ",
	"OT": "Olt",
	"PH": "Prahova",
	"SJ": "Sălaj",
	"SM": "Satu mare",
	"SB": "Sibiu",
	"SR": "Străinătate",
	"SV": "Suceava",
	"TR": "Teleorman",
	"TM": "Timiş",
	"TL": "Tulcea",
	"VL": "Vâlcea",
	"VS": "Vaslui",
	"VN": "Vrancea"
};

function csvJSON(csv) {
	var lines = csv.split("\n");
	var result = [];
	var headers = lines[0].split(",");
	for (var i = 1; i < lines.length; i++) {
		var obj = {};
		var currentline = lines[i].split(",");
		for (var j = 0; j < headers.length; j++) {
			obj[headers[j].replace(/"/g, '')] = (!isNaN(currentline[j]) ? ~~currentline[j] : currentline[j]);
		}
		result.push(obj);
	}
	return result;
}

function sumObjectsByKey(...objs) {
	return objs.reduce((a, b) => {
		for (let k in b) {
			if (b.hasOwnProperty(k) && !isNaN(a[k]));
			a[k] = (a[k] || 0) + b[k];
		}
		return a;
	}, {});
}

function titleCase(str) {
	var splitStr = str.toLowerCase().split(' ');
	for (var i = 0; i < splitStr.length; i++) {
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	return splitStr.join(' ');
}
const hour = Math.max(7, Math.min(new Date().getHours(), 20));
// hour = Math.max(7, Math.min(hour, 20))
for (let i = 7; i <= 21; i++) {

	document.getElementById('elections').insertAdjacentHTML('beforeend', `<option value="` + ('0' + i).slice(-2) + `-00">Ora ` + ('0' + i).slice(-2) + ``);
}
const urlParams = new URLSearchParams(window.location.search);
let election = urlParams.get('hour');
if (!election) election = ('0' + hour).slice(-2) + "-00";
document.querySelector('#elections [value="' + election + '"]').selected = true;

document.getElementById('elections').onchange = function() {
	let e = document.getElementById('elections');
	const val = e.options[e.selectedIndex].value;
	window.location = `prezenta.html?hour=${val}`;
}
let isLight = true;
document.getElementById('darkMode').onclick = function() {
	if (isLight) {
		document.getElementById('darkMode').innerText = '🌙';
		isLight = false;
		darkTile.addTo(map);
		lightTile.removeFrom(map);
	} else {
		document.getElementById('darkMode').innerText = '🔆';
		isLight = true;
		lightTile.addTo(map);
		darkTile.removeFrom(map);
	}
}

var map = L.map('map').setView([45.9628666, 25.2081763], 7.4);
window.map = map;
let lightTile = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmFyc2UiLCJhIjoiY2tnM3JnOHJtMGRnNzMzcDQ2a3dldHpyYiJ9.cdOn_RRX1YoMWUmoR6i36A', {
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
		'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	id: 'mapbox/light-v9',
	tileSize: 512,
	zoomOffset: -1
});
let darkTile = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmFyc2UiLCJhIjoiY2tnM3JnOHJtMGRnNzMzcDQ2a3dldHpyYiJ9.cdOn_RRX1YoMWUmoR6i36A', {
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
		'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	id: 'mapbox/dark-v9',
	tileSize: 512,
	zoomOffset: -1
});
lightTile.addTo(map);
lightTile.addTo(map);

function onEachFeature(feature, layer) {

	popupContent = `
<h1>${feature.properties.county}: ${feature.properties.name}</h1>
<h3>
Numar Votanti: ${feature.properties.data.totalVoters}<br>
Total voturi: ${feature.properties.data.LT}<br>
<small>LS: ${feature.properties.data.LS} LP: ${feature.properties.data.LP} LSC: ${feature.properties.data.LSC}</small><br>
Procent: ${(feature.properties.data.percentage*100).toFixed(2)}%<br>
</h3>
<div class="overFlow">`;
	let grupe = []
	Object.keys(feature.properties.data).forEach(e => {
		if (~e.indexOf('Bar') || ~e.indexOf('Fem'))
			grupe.push({
				'type': e,
				'value': feature.properties.data[e]
			});
	})
	grupe.sort((a, b) => parseInt(b.value) - parseInt(a.value));

	grupe.forEach((v) => {
		popupContent += `${v.type} : ${v.value} <br>`;
	})
    // popupContent += JSON.stringify(feature.properties.data);
	popupContent += '</div>';
	var popup = L.popup({
			maxWidth: 700,
			maxHeight: 800
		})
		.setContent(popupContent);
	layer.bindPopup(popup);
}
let geoJSON = null;
window.reparseData = () => {
	fetch('map/comune.geojson')
		.then(response => response.json())
		.then(async data => {
			while (electionData.length < 1) {}
			if (geoJSON) geoJSON.removeFrom(map);
			geoJSON = await L.geoJSON(data, {

				style: function(feature) {
					feature.properties.stroke = "#000000";
					let county = titleCase(feature.properties.county.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/(Munincipiul|Oras) /i, ''));
					const comuna = titleCase(feature.properties.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/(Munincipiul|Oras) /i, '').toUpperCase());

					if (!electionData.hasOwnProperty(county)) console.log(`MISSING ${county} : ${comuna}`, electionData)
                    if (!electionData[county].hasOwnProperty(comuna)) console.log(`MISSING ${county} : ${comuna}`, electionData[county])
                    //electionData[county][comuna]['LT'] = electionData[county][comuna]['LP'] + electionData[county][comuna]['LS'] + electionData[county][comuna]['LSC'];
                    if(comuna === 'Siriu')console.log(electionData[county][comuna]);
                    let percentage = (electionData[county][comuna]['LT'] / electionData[county][comuna]['totalVoters']).toFixed(5);
                    let fillColor = '#ff0000';
                    if (isNaN(percentage)) 
                    {
                        percentage = 0;
                        fillColor = '#dddddd';
                    }
					feature.properties.data = electionData[county][comuna];
                    feature.properties.data.percentage = percentage;
                    if (!electionData[county][comuna]['totalVoters']) 
                    {
                        percentage = 1;
                        fillColor = '#878787';
                    }
					return {
						fillColor: fillColor,
						weight: 0.3,
						color: "#000000",
						fillOpacity: percentage
					}
				},
				onEachFeature: onEachFeature,
			});
			geoJSON.addTo(map);
		});
}
let electionData = {};
fetch(`https://cors-anywhere.herokuapp.com/https://prezenta.roaep.ro/parlamentare06122020/data/csv/simpv/presence_2020-12-06_${election}.csv`)
//fetch("presence.csv")
	.then(response => response.text())
	.then(json => {
		let data = csvJSON(json);
		data.forEach(e => {
			if (e.UAT) {
				let judet = counties[e.Judet].normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/(Municipiul|Oras) /i, '');
				let comuna = e.UAT.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/(Municipiul|Oras) /i, '');
				comuna = comuna.replace(/"/g, '');
				judet = titleCase(judet);
				comuna = titleCase(comuna);
				if (!electionData[judet]) electionData[judet] = {};
				e.totalVoters =~~e["Votanti pe lista permanenta"] + e["Votanti pe lista complementara"];
				for (key in e) {
					if (isNaN(e[key])) delete(e[key]);
				}
				electionData[judet][comuna] = sumObjectsByKey(electionData[judet][comuna], e);
			}
		});
		window.reparseData();
	});