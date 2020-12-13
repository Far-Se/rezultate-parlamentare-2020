window.partideColors = {};
window.partySelected = -1;
window.partide = {
	"PARTIDUL NATIONAL LIBERAL": '#F7D600',
	"PARTIDUL SOCIAL DEMOCRAT": '#EC1C24',
	"PARTIDUL MISCAREA POPULARA": '#2C3E50',
	"PARTIDUL PRO ROMANIA": '#8D4FFF',
	"UNIUNEA DEMOCRATA MAGHIARA DIN ROMANIA": '#1ED760',
	"ALIANTA USR PLUS": '#00A6FF',
	"ALIANTA PENTRU UNIREA ROMANILOR": '#A16800',
	"PARTIDUL MISCAREA POPULARA": "#0083C9"
}
window.winnerParties = [];
window.partiesPercentage = [];
window.totalVoturi = 0;
let legend = document.getElementById('legend');
Object.keys(window.partide).forEach((e) => {
	legend.insertAdjacentHTML('beforeend', `
    <div style="background: ${window.partide[e]};" data-partid="${e}"><span>${e}</span></div>
    `)
})

let els = document.querySelectorAll('#legend div');
for (i = 0; i < els.length; i++) {
	els[i].addEventListener('click', function() {
		let party = this.getAttribute('data-partid');

		if (window.partySelected == party) window.partySelected = 0;
		else window.partySelected = party;
		window.reparseData();
	});
}

const urlParams = new URLSearchParams(window.location.search);
let election = urlParams.get('file');
if (!election) election = 'senat';
document.querySelector('#elections [value="' + election + '"]').selected = true;
let Locul2 = false;
if (~election.indexOf('2')) {
	Locul2 = true;
	election = election.substr(1);
}

document.getElementById('elections').onchange = function() {
	let e = document.getElementById('elections');
	election = e.options[e.selectedIndex].value;
	if (~election.indexOf('2')) {
		Locul2 = true;
		election = election.substr(1);
	}
	window.prepareData();
	//window.location = `index.html?file=${val}`;
}
document.querySelectorAll('input[name="tipIzolare"]').forEach(e => e.addEventListener('change', () => {
	if (isNaN(window.partySelected)) window.reparseData();
}));
document.getElementById('collapse').onclick = function() {
	document.getElementById('tipIzolare').classList.toggle('hide');
	document.getElementById('legend').classList.toggle('hide');
	document.getElementById('selectElection').classList.toggle('hide');

	document.getElementById('ascunde').classList.toggle('hide');
	document.getElementById('arata').classList.toggle('hide');
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

var map = L.map('map', {
	zoomSnap: 0,
	zomDelta: 5
}).setView([45.9628666, 25.2081763], 7.4);
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
	let comuna = feature.properties.name;
	let county = feature.properties.county;
	popupContent = `<h1>${county}: ${comuna}</h1>`;
	if (Locul2)
		popupContent += `<h2>Locul 2: ${feature.properties.castigator}</h2>`;
	else
		popupContent += `<h2>Castigator: ${feature.properties.castigator}</h2>`;
	popupContent += `<h3>TotalVoturi: ${feature.properties.totalVoturi}</h3>`;
	try {
		feature.properties.data.forEach(e => {
			if (window.partide[e.nume])
				popupContent += `<h4 class="colored" style="background:${window.partide[e.nume]}"><span>${e.nume}: ${e.voturi} voturi ${((e.voturi/feature.properties.totalVoturi)*100).toFixed(3)}%</span></h4>`
			else
				popupContent += `<h4><span>${e.nume}: ${e.voturi} voturi ${((e.voturi/feature.properties.totalVoturi)*100).toFixed(3)}%</span></h4>`
		})
	} catch {}
	if (feature.properties && feature.properties.popupContent) {
		popupContent += feature.properties.popupContent;
	}
	var popup = L.popup({
			maxWidth: 700,
			maxHeight: 800
		})
		.setContent(popupContent);
	layer.bindPopup(popup);
}
let geoJSON = null;
window.partyMaxVotes = {};
window.partyMaxPercentage = {};
window.reparseData = () => {
	const isolationType = document.querySelector('input[name="tipIzolare"]:checked').value;
	let partideComp = [];
	if (document.querySelectorAll('.comp:checked').length >= 2) {
		document.querySelectorAll('.comp:checked').forEach(e => {
			partideComp.push(e.getAttribute('data-partid'));
		})
	}
	fetch('map/comune.geojson')
		.then(response => response.json())
		.then(async data => {
			if (geoJSON) geoJSON.removeFrom(map);
			geoJSON = await L.geoJSON(data, {

				style: function(feature) {
					feature.properties.stroke = "#000000";
					let county = feature.properties.county.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/(Munincipiul|Oras) /i, '').toUpperCase();
					const comuna = feature.properties.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/(Munincipiul|Oras) /i, '').toUpperCase();
					let fillColor = '#282C34';
					let fillOpacity = 1;
					if (window.electionResult.hasOwnProperty(county)) {
						if (window.electionResult[county].hasOwnProperty(comuna)) {
							let rezultat = window.electionResult[county][comuna];
							let partide = [];
							let totalVoturi = 0;
							Object.keys(rezultat).forEach(n => {
								partide.push({
									nume: n,
									voturi: ~~rezultat[n]
								})
								totalVoturi += rezultat[n];
								window.partiesPercentage[n] = (window.partiesPercentage[n] || 0) + parseInt(rezultat[n]);
								window.totalVoturi += ~~rezultat[n];
							});
							partide.sort((a, b) => b.voturi - a.voturi);
							let castigator = partide[0].nume;
							if (Locul2 == 1) {
								if (partide[1]) castigator = partide[1].nume;
							}
							if (window.partide[castigator]) {
								window.winnerParties[castigator] = (window.winnerParties[castigator] || 0) + 1;
								fillColor = window.partide[castigator];
							}
							feature.properties.data = partide;
							feature.properties.castigator = castigator;
							feature.properties.totalVoturi = totalVoturi;

							if (isNaN(window.partySelected)) {
								if (isolationType === 'simple') {
									if (castigator != window.partySelected) {
										if (rezultat.hasOwnProperty(window.partySelected))
											fillOpacity = 0.2;
										else
											fillOpacity = 0.01;
									}
								} else if (isolationType === 'procent') {
									if (rezultat.hasOwnProperty(window.partySelected)) {
										let procent = (rezultat[window.partySelected] / totalVoturi);
										fillOpacity = (procent / window.partyMaxPercentage[window.partySelected]) * 100;
										fillColor = window.partide[window.partySelected];
									} else fillOpacity = 0.01;
								} else if (isolationType === 'votes') {
									if (rezultat.hasOwnProperty(window.partySelected)) {
										fillOpacity = (rezultat[window.partySelected] / totalVoturi);

										fillColor = window.partide[window.partySelected];

									} else fillOpacity = 0.01;
								}
							}
							if (partideComp.length === 2) {
								if (rezultat.hasOwnProperty(partideComp[0]) && rezultat.hasOwnProperty(partideComp[1])) {
									if (rezultat[partideComp[0]] > rezultat[partideComp[1]]) fillColor = window.partide[partideComp[0]]
									else fillColor = window.partide[partideComp[1]]
								}else fillColor = '#dddddd';
							}

						}
					}
					return {
						fillColor: fillColor,
						weight: 0.3,
						color: "#000000",
						fillOpacity: fillOpacity
					}
				},
				onEachFeature: onEachFeature,
			});
			geoJSON.addTo(map);
			if (window.partySelected != -2 && window.partySelected < 0) {
				Object.keys(window.partide).forEach(e => {
					let el = document.querySelector(`#legend div[style="background: ${window.partide[e]};"]`);
					el.setAttribute('data-votes', window.partiesPercentage[e]);
					if (el) el.innerHTML = `<input type="checkbox" class="comp" data-partid="${e}"><span>${e}: ${winnerParties[e] || 0} UAT-uri, ${(window.partiesPercentage[e] / window.totalVoturi * 100).toFixed(3)}%</span>`;
				});
				const container = document.querySelector('#legend');
				const order = -1;
				Array.from(container.children)
					.sort((a, b) => order * parseInt(a.dataset.votes, 10) - order * parseInt(b.dataset.votes, 10))
					.forEach(element => container.appendChild(element));

				document.querySelectorAll('.comp').forEach((e) => e.onchange = (x) => {
					if (document.querySelectorAll('.comp:checked').length >= 2)
						document.querySelectorAll('.comp:not(:checked)').forEach(e => e.setAttribute('disabled', 'true'));
					else
						document.querySelectorAll('.comp').forEach(e => e.removeAttribute('disabled'));
				});
			}
		});
}
window.prepareData = () => {
	fetch('data/' + election + '.json').then(e => e.json()).then(data => {
		window.electionResult = data;
		Object.entries(data).forEach(([key, val]) => {
			Object.entries(val).forEach(([k, v]) => {
				const totalVotes = Object.values(v).reduce((a, b) => a + b);
				Object.entries(v).forEach(([party, votes]) => {

					if (!window.partyMaxVotes.hasOwnProperty(party)) window.partyMaxVotes[party] = votes;
					if (window.partyMaxVotes[party] < votes) window.partyMaxVotes[party] = votes;
					const percent = ((votes / totalVotes) * 100);
					if (!window.partyMaxPercentage.hasOwnProperty(party)) window.partyMaxPercentage[party] = percent;
					if (window.partyMaxPercentage[party] < percent) window.partyMaxPercentage[party] = percent;

				});

			})
		});
		window.reparseData();
	});
}
window.prepareData();