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
fetch('pv_prov_cnty_s_sr.csv').
then(e => e.text()).
then(t => {
	data = csvJSON(t);
	let totalPartide = [];
	let tariCastigate = {};
	let tari = [];
	data.pop();
	data.forEach(e => {
		if (isNaN(e.uat_name)) {
			let partide = [];
			Object.keys(e).forEach(x => {
				if (~x.indexOf('voturi')) {
					if (e[x] !== undefined) {
						const name = x.replace('-voturi', '');
						partide.push({
							nume: name,
							voturi: ~~e[x]
						})
						totalPartide[name] = ~~totalPartide[name] + e[x];
					}
				}
            })
            if(tari[e.uat_name])
            {
                Object.entries(tari[e.uat_name]).forEach(([key,val])=>{
                    if(e.uat_name == 'FEDERATIA RUSA') console.log(key,val);
                    if(partide[key])tari[e.uat_name][key] += partide[key];
                })
            }else
			tari[e.uat_name] = partide;
            if(e.uat_name == 'FEDERATIA RUSA') console.log(partide);
		}
	});
	console.log(tari);
	Object.entries(tari).forEach(([partide, e]) => {
        console.log(e);
		partide.sort((a, b) => parseInt(b.voturi) - parseInt(a.voturi));
		tariCastigate[partide[0]['nume']] = (tariCastigate[partide[0]['nume']] || 0) + 1;
		let el = document.querySelector('#output');
		el.insertAdjacentHTML('beforeend', `<h1>${e}<h1>`);
		partide.forEach(p => {
			el.insertAdjacentHTML('beforeend', `${p.nume}: ${p.voturi}<br>`);
		});
	})
	let totalPartideObject = [];
	totalPartide.map((n, v) => {
		totalPartideObject.push({
			nume: n,
			voturi: v
		})
	});
	totalPartideObject.sort((a, b) => parseInt(b.voturi) - parseInt(a.voturi));
	Object.values(totalPartideObject).forEach(e => {
		document.querySelector('#sumUp').insertAdjacentHTML('beforeend', `${e.nume}: ${e.voturi}<br>`);
	})
	Object.keys(tariCastigate).forEach((e) => {
		document.querySelector('#tariCastigate').insertAdjacentHTML('beforeend', `${e}: ${tariCastigate[e]}<br>`);

	})
})