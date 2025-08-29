document.getElementById('randomize').onclick = function() {
    const texts = ['1995 Bullhorn Buffalo 3500', '2006 Bullhorn Buffalo 1500', '2009 Doghouse', '2006 Bullhorn Buffalo 2500', '2006 Bullhorn Buffalo 2500', '2012 Doghouse', '2014 Doghouse', 'Early 2010 Doghouse', '2010 Filming Doghouse', '2010 Bullhorn Doghouse', '2015 Doghouse', '2010 Doghouse', 'Vortex 2 Probe Truck', 'Charger/2017 BullHorn Prancer SXT', '2006 Elysion Slick Si', 'Forester/2018 Sumo Woodlands XT', 'Dominator Fore', '1997 Falcon Traveller XLT', '2017 Falcon Advance Lariat', '2011 Vellfire Prairie Grade', '2021 Combi Kuma GT-Line', 'Grizzly', '1992 Chevlon 454 SS', '2008 Chevlon Camion EXT', 'Discovery Support Vehicle', '2006 Chvelon Zafiro', '2017 Chevlon Platoro 1500', '2011 Brawnson Arlington', 'Ole Blue', '1991 Navara Territory', 'Scout', 'Dominator 1', '2009 Dominator 1', '2012 Dominator 1', '2011 Dominator 1', '2013 Dominator 1', '2014 Dominator 1', 'TIV 1', 'Dominator 2', '2012 Dominator 2', '2013 Dominator 2', '2014 Dominator 2', 'Dominator 3', 'TIV 2', '2020 TIV 2', '2009 TIV 2', '2010 TIV 2', '2012 TIV 2', '2015 TIV 2', '2008 TIV 2', '2012 Tornado Alley TIV 2', '2023 TIV 2', '2024 TIV 2', 'DOW 3', 'RaXPol', 'DOW 6'];;
	const texts2= ['TVN Video Probe', 'V2 Tornado Pod', 'Dorothy', 'TOTO', 'HITPR', 'TWISTEX Tower', 'TIV Hammer'];;
	text = texts[Math.floor(Math.random() * texts.length)];
	text2 = texts2[Math.floor(Math.random() * texts2.length)];

    document.getElementById("vehicles").innerText = text;
	document.getElementById("probes").innerText = text2;
};