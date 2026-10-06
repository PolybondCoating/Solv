# Most AI powder-coating numbers fail source checks

Of the ten numbers you asked about, only one is solidly confirmed as written: the **under 1 megohm ground resistance**, which Nordson prints in its equipment manuals. Two more are usable with a caveat: a **30% reclaim cap** (the reports' "70/30" is right, but their "up to 40-50%" is not) and a **40-60% humidity range** (wider than the reports' 40-50%). Everything else is either unsourced or contradicted: **260 C preheat, 3 C above dew point, 5 C oven raise, 40-50 C entering spray, ISO 8573 Class 1/Class 4, and dyne 42-44** had no support in any maker data sheet, standard or trade source we could find. **60 um film** is real but comes from an aluminium architectural spec, so it cannot be a general minimum. The qualitative cause lists in the two reports (contamination causes craters, thick film causes sags, bad pretreatment causes adhesion loss) hold up well. The numbers are where they fail. Our records already take the safer stance on cure (metal temperature first, data sheet wins, no bare "raise oven temperature" step), and the research backs that stance. The changes we need are mostly deletions and tightening. Caveat: we did not have the two uploaded reports themselves, only the claim list in your brief, and most sources were read through a summarising fetch tool, so exact quotes should be spot-checked before they go into the app.

## The cure rules in our records are what the sources actually say

The strongest and most consistent finding concerns cure. The Powder Coating Institute (PCI) states that the time and temperature on a data sheet refer to **part temperature, not oven air temperature**, and recommends data loggers or infrared pyrometers to check ([PCI](https://www.powdercoatedtough.com/News/ID/349/PC-Summitry-Achieving-Powder-Cure-and-Avoiding-Craters)). Its Technology Interchange adds that if a data sheet says 15 minutes at 375 F, every part must reach at least that temperature and stay there for 15 minutes, and that oven recovery after loading "does not accurately indicate the part temperature" ([PCI](https://www.powdercoatedtough.com/News/ID/4052/categoryId/4/Technology-InterchangeHow-Oven-Conditions-Affect-Powder-Coating-Performance)). A 2026 PCI column says air temperature alone is not a reliable indicator and that profiling actual metal temperature is essential ([PCI](https://www.powdercoatedtough.com/News/ID/5487/Ask-the-Expert-MayJune-2026)). A trade article makes the same point: the cure time on a data sheet is time at metal temperature ([Products Finishing](https://pfonline.com/articles/curing-temps-and-times)).

That makes the "raise oven temperature about 5 C" fix a problem. Two sources do say raising oven temperature helps haze (blooming) because metal then heats faster ([Diamond Vogel via Products Finishing](https://pfonline.com/articles/what-is-blooming-in-powder-coating-and-how-do-i-prevent-it); [IFS Coatings](https://finishingandcoating.com/index.php/powder-coat/1233-fixing-appearance-issues-when-powder-coating-jobs-go-wrong)), but **neither gives a 5 C figure**. A third source says bloom on thick parts comes from long exposure at moderate temperature and slow cooling, so a higher setpoint alone can make it worse ([Polymers Paint Colour Journal](https://polymerspaintcolourjournal.com/?p=18510)). Axalta lists a too-reactive powder and a poor temperature profile among the causes of orange peel ([Axalta](https://www.axalta.com/powder_us/en_US/technical/frequently-asked-questions/problems-on-the-coated-object.html)). Raising the setpoint is therefore only justified after a measurement shows the parts missed the data-sheet metal temperature and time. This matches our rule of no bare "raise oven temperature" step. One honest limit: no source quantifies how much an oven may be raised, so the app should not invent a number.

## Preheat for castings and galvanized: the 260 C figure has no source

The reports' degassing advice (260 C for 5-10 minutes, never above 290 C) is **unsourced as stated, and each part of it conflicts with something**. Sources agree the preheat should be at or above cure temperature, but the offsets vary: PCI says 20-30 F above the recommended bake (about 11-17 C) ([PCI](https://powdercoatedtough.com/News/ID/5239/Dealing-with-OutgassingRoot-Causes-and-Mitigation-Techniques)); TIGER Drylac says at least 20 C above the data-sheet metal temperature ([TIGER](https://www.tiger-coatings.com/about/tiger-blog/outgassing-in-powder-coating)); and the American Galvanizers Association (AGA) says about 65 F (36 C) above cure ([AGA](https://galvanizeit.org/knowledgebase/article/powder-coating-adhesion-and-outgassing)). Ceilings differ too. AGA caps galvanized preheat at **535 F (about 279 C)**, and only when phosphate treatment was applied, because higher heat damages the phosphate layer ([hotdipgalvanizing.com](https://www.hotdipgalvanizing.com/technical-resources/powder-coating-adhesion-and-outgassing-galvanized-steel)). For iron castings TIGER says no higher than **450 F (232 C)**, typically 400-420 F with **45-50 minutes** at temperature ([TIGER](https://www.tiger-coatings.com/ca-en/tiger-group/tiger-blog/how-to-prevent-outgassing-of-iron-castings)). So 260 C sits above the casting ceiling, and 290 C sits above the galvanized ceiling.

The **5-10 minute dwell is the weakest piece**. Every source that gives a time says 15 minutes or more: 15-30 minutes from a coatings distributor ([Columbia Coatings](https://www.columbiacoatings.com/?p=134074)), 45-50 minutes for castings, and about an hour for galvanized, held until the part itself reaches oven temperature (AGA). Our records should say: preheat to the powder's data-sheet metal temperature plus the maker's offset, hold until the part (not the air) is at temperature, and take the ceiling from the data sheet, the pretreatment limits and the standard ASTM D7803. We could not read D7803's own temperatures because it is paywalled.

Sources also split on what happens after preheat. TIGER and PCI say coat while the part is still slightly warm to stop it re-absorbing air and moisture, while AGA and some trade articles say cool to the maker's application temperature. Because of this split, the app should defer to the data sheet here.

The rest of the outgassing advice is well supported. Reducing film thickness, using degassing powders, and using an anti-gassing primer are all recommended by makers: PCI wants film under 5 mils (about 127 um) and preferably under 4 mils (about 100 um); Interpon's anti-gassing primer data sheet gives 60-80 um ([Interpon APA151](https://powdercoatings.brand.akzonobel.com/m/58001c8a40a13adf/original/APA151-Primer-FL151F.pdf)). Sweep blasting before pretreatment on galvanized work is confirmed by AGA and ASTM D7803, with the caveat that Interpon says "sweeping" with a maximum 5-10 um zinc loss rather than naming the US standard SSPC-SP 16 ([Interpon](https://powdercoatings.brand.akzonobel.com/m/58001c8a40a13adf/original/APA151-Primer-FL151F.pdf)). Phosphate must be zinc-suitable, because standard iron phosphate may attack zinc (hotdipgalvanizing.com). Zinc oxide (white rust) weakening adhesion is confirmed by ASTM D7803 and AGA ([ASTM](https://store.astm.org/d7803-25.html)); the removal methods the reports suggest, wire brush and vinegar, come from a general galvanizing document that never mentions powder, so confirm with the powder maker first.

## Humidity, dew point and air quality: ranges are wider and two numbers are unsourced

For booth humidity the evidence supports **40-60%**, not 40-50%. Talbert in Products Finishing gives 40-60% ([Products Finishing](https://www.pfonline.com/articles/atmospheric-control-of-the-powder-spray-area)), Hale in PCI gives 45-60% ([PCI](https://www.pcimag.com/articles/94342-powder-coating-q-a-1)), and powder storage guidance from Sherwin-Williams, Teknos and TIGER is also 40-60% ([Sherwin-Williams](https://industrial.sherwin-williams.com/na/us/en/general-industrial/resources/moisture-powder.html); [Teknos](https://www.teknos.com/globalassets/teknos.com/industrial-coatings/downloads/brochures/powder-coatings-brochures/infralit_powder_coatings_storage_and_handling_-instructions.pdf)). The only "no more than 50%" figure found is an aerospace specification, which applies to specification-driven work, not general powder ([Products Finishing](https://pfonline.com/articles/humidity-problem)). The direction is solid: low humidity weakens charging and high humidity hurts fluidization and causes clumping. Notably, several of these are columns by the same author, so agreement is partly one voice, and no equipment maker's booth humidity figure was retrieved. Nordson's 95% non-condensing is an equipment rating, not a coating target ([Nordson](https://emanuals.nordson.com/finishing/files/Powder/1102729.pdf)).

The **"3 C above dew point" rule has no powder source**. ISO 8502-4 is a guide for painting on blast-cleaned steel; its public abstract describes calculating dew point and surface temperature but states no 3 C margin ([ISO](https://www.iso.org/standard/15718.html)). The rule is plausible for cooled parts leaving a dry-off oven during monsoon, but it is borrowed from liquid-paint practice.

On compressed air, the reports' **ISO 8573 classes (oil Class 1, water Class 4)** and **dyne 42-44** are unsourced. The only hard air numbers found come from the Nordson Econo-Coat manual: pressure dew point of -6.7 to 3.4 C or lower and oil vapour no more than 0.1 ppm, quoted by a booth supplier ([paintbooth.com](https://www.paintbooth.com/compressed-air-powder-coating-gun-hopper/)). Those are one gun series and not expressed as ISO classes, so the app should point to the gun maker's manual. Nothing explains why dyne readings of 42-44 would be a pass mark, and the "filters every 3-6 months" interval is also unsourced. The cause list itself is solid: Axalta and PCI both confirm oil, silicone, dirty compressed air and poor pretreatment as crater causes ([Axalta](https://www.axalta.com/powder_us/en_US/technical/frequently-asked-questions/problems-on-the-coated-object.html); [PCI](https://www.powdercoatedtough.com/News/ID/349/PC-Summitry-Achieving-Powder-Cure-and-Avoiding-Craters)), and a trade column notes silicone at 0.001% can cause widespread cratering ([Powder Coating magazine](https://pcimag.com/articles/94568-ask-joe-powder-3)).

## Electrostatics and reclaim: grounding and the 30% cap are usable

Ground resistance is the cleanest win. Nordson requires every conductive object in the spray area to be grounded with **no more than 1 megohm**, measured with an instrument applying at least 500 volts ([Nordson manual, p. 1-3](https://emanuals.nordson.com/finishing/files/Powder/1102729.pdf)); Gema says the same ([Gema](https://gemapowdercoating.com/fileadmin/documents/Sonstige_PDF-Dateien/Ask_the_Experts/Ask_the_Experts-July-August_2022.pdf)). It is a ceiling, not a target, and no maker gives a lower figure. Back-ionization causes and fix directions are confirmed (too much voltage or current, gun too close, poor grounding, thick film), but no source gives a percentage: Gema, Thermaset and Talbert all say "reduce voltage" without a number ([Gema](https://www.gemapowdercoating.com/en/support/tips-tricks/back-ionizer); [Thermaset](https://thermaset.co.uk/technical-support/general-tips/)). Write it as "reduce until the defect goes". Faraday cage fixes of lower voltage, correct spray pattern and gun position are supported ([PCI](https://www.pcimag.com/articles/94272-powder-coating-q-a)); tribo guns as a Faraday fix and "tribo does not cause back-ionization" are plausible by mechanism but unsourced.

On reclaim, a consultant writing in PCI says never exceed a **30% reclaim-to-virgin ratio** ([PCI](https://www.pcimag.com/articles/110185-using-reclaimed-powder)), and TIGER Drylac's metallic sheet says virgin powder should not fall below 70% ([TIGER](https://www.tiger-coatings.com/fileadmin/user_upload/downloads_na_new/technical-information-sheets/tiger-drylac/US/TIGER_Drylac_Metallics_OFI.pdf)). So 70/30 is confirmed, **40-50% is disputed**, and "90/10 for metallics" is stricter than the one maker figure and unsourced. Axalta defers to the powder maker's recommendation, which again says data sheet wins ([Axalta](https://www.axalta.com/powder_us/en_US/technical/frequently-asked-questions/specific-characteristics-metallic-powders.html)). The 150 um sieve is unsourced; the only sieve figure found is 175 um for a different purpose.

## Verdict per claim

| Claim | Verdict | What the sources say |
|---|---|---|
| Non-metallic clouding: film variation, charging, fluidization, reclaim | Partly confirmed, but for metallics only | Axalta, Kabe and TIGER describe clouding for metallic and dry-blend powders; none for plain solids. "Carbon layer" meaning: no source |
| Blooming is a wipe-off white haze | Confirmed with limits | Two sources say it often wipes off; wiping is a symptom, not a test. Causes differ by source |
| "Under-cure causes bloom" | Disputed | IFS says low temperature on thick metal; Biller says long moderate-temperature exposure and slow cooling |
| Overbake, gas fumes, wax migration, amine bloom as bloom causes | Unsourced | None found for thermoset powder |
| Preheat 260 C, 5-10 min, max 290 C | Unsourced, conflicts with sources | Ceilings of 232 C (castings) and 279 C (galvanized with phosphate); dwell 15 min to 1 h |
| Preheat above cure, part reaches temperature | Confirmed | PCI, TIGER, AGA; offsets 11-36 C vary |
| Sweep blast, zinc-suitable phosphate, then preheat (galvanized) | Confirmed | AGA, ASTM D7803, Interpon; order differs for castings |
| Thin film, degassing powder or primer for outgassing | Confirmed | PCI, TIGER, Interpon |
| Moisture causes pinholes; storage 40-60% RH | Confirmed | Sherwin-Williams, Teknos; moisture-origin pinholes not distinguished from substrate gas |
| Vent holes and thick castings trapping gas | Partly confirmed | Castings confirmed as gas sources; "thick sections" and weld vents have no powder source |
| White rust weakens adhesion | Confirmed | ASTM D7803, AGA; vinegar and wire brush method not powder-specific |
| Back-ionization causes | Confirmed | Gema, Thermaset, Talbert; each names different causes |
| Reduce kV 10-20% | Unsourced | No percentage anywhere |
| Part ground under 1 megohm | Confirmed | Nordson manuals, Gema, Talbert |
| Faraday cage: lower kV, pattern, position | Confirmed | Talbert, Thermaset, Axalta (jigging) |
| Faraday cage: tribo or conical nozzle | Unsourced | Flat tips partly supported by Wagner; conical nozzle in no source |
| Tribo guns avoid back-ionization | Unsourced | Plausible by mechanism only |
| Booth RH 40-50% | Disputed | Evidence is 40-60% or 45-60% |
| Dew point 3 C above | Unsourced for powder | ISO 8502-4 abstract gives no figure |
| Craters from oil, silicone, dirty air | Confirmed | Axalta, PCI |
| Craters: ISO 8573 Class 1 / Class 4; dyne 42-44; filters 3-6 months | Unsourced | Only Nordson manual figures found, not ISO classes |
| "Fish eyes are not caused by thick film" | Unsourced | No source lists film thickness as a crater cause; not contradicted |
| Orange peel: thick film, slow heat-up, old powder | Confirmed | Sames via Products Finishing, Axalta; Axalta and Sames say too thick or too thin |
| Parts 40-50 C entering spray | Disputed | Only source says under 40 C for parts leaving dry-off |
| Film "target plus 20%", sanding fixes orange peel | Unsourced | No source |
| Sags: thick or uneven film | Confirmed | Axalta: thick or variable film, heating rate |
| Sags: "parts too hot, below 40 C"; raise voltage | Disputed / unsourced | 40 C figure belongs to orange peel; voltage advice points the other way |
| Adhesion: bad pretreatment, under-cure | Confirmed | Axalta, PCI |
| Adhesion: over-cure | Confirmed narrowly | Only over-cure of a first coat before recoating |
| ASTM D3359 ratings; iron vs zinc phosphate by substrate; flash rust | Unsourced here | Iron-versus-zinc phosphate is supported for galvanized work only (AGA) |
| Corrosion: pretreatment, thin film, edges, under-cure | Confirmed | PCI, Axalta |
| Corrosion: creep under 3 mm after 500 h | Unsourced, conflicts | Qualicoat limits are filiform 4 mm / 2 mm and 1000 h acetic-acid salt spray |
| Reclaim 70/30 | Confirmed | Biller (PCI), TIGER |
| Reclaim up to 40-50%; 90/10 metallics; 150 um sieve; same powder only | Disputed / unsourced | Sources cap at 30%; 175 um sieve is for blending additive |
| Raise oven about 5 C | Unsourced, against our rule | No figure anywhere; metal temperature first |

## Which numbers the app can use

| Number | Use it? | Condition |
|---|---|---|
| 260 C preheat | No | Use data-sheet metal temperature plus maker offset; show 232 C and 279 C only as caps from named sources |
| 70/30 reclaim | Yes, as a guideline | State 30% as a maximum; defer to the data sheet |
| 3 C above dew point | No | Offer as a general good-practice prompt at most, labelled as borrowed from paint practice |
| RH 40-50% | No | Use 40-60% |
| Under 1 megohm | Yes | Ceiling, tested at 500 V |
| 5 C oven raise | No | Replace with a metal-temperature check |
| 40-50 C entering spray | No | Footnote only: under 40 C leaving dry-off (Sames), orange-peel context |
| 60 um film | Only if the data sheet says so | Qualicoat figure for architectural aluminium Class 1-2; Class 3 is 50 um ([Qualicoat copy](https://camdocs.camden.gov.uk/CMWebDrawer/Record/10271052/file/document)); that copy is secondary |
| ISO 8573 classes | No | Refer to the gun maker's manual; Nordson's -7 to 3 C dew point and 0.1 ppm oil is one example |
| Dyne 42-44 | No | No source |

## What to change in our records

- Delete the 5 C oven-raise wording wherever it appears; keep "check part metal temperature against the data sheet first", and add that a higher setpoint can worsen orange peel and bloom.
- Replace the 260 C / 5-10 min / 290 C preheat with "data-sheet metal temperature plus the maker's offset, held until the part is at temperature", and note the caps of 232 C (iron castings, TIGER) and 279 C (galvanized with phosphate, AGA) as attributed examples.
- Change reclaim to "70/30 at most 30% reclaim"; remove 40-50%, 90/10 and the 150 um sieve.
- Change booth humidity to 40-60%; drop the 3 C dew-point rule or label it as borrowed from paint practice.
- Remove ISO 8573 classes, dyne 42-44 and the 3-6 month filter interval; point to the gun maker's manual.
- Keep "under 1 megohm" and add "measured at 500 V or more".
- Keep the 40 C hot-part note as a footnote only, tied to orange peel and parts leaving dry-off, and remove the "40-50 C" range and the "parts too hot" sag cause.
- Treat 60 um as a data-sheet value, not a universal minimum; remove "creep under 3 mm after 500 h" and any salt-spray hours not tied to a named standard.
- Remove "reduce kV 10-20%", "target plus 20%" and "sanding fixes orange peel", or mark them as unverified.
- Describe clouding as a metallic/dry-blend issue unless the powder maker says otherwise, and do not state that under-cure causes bloom.

## Conclusion

The pattern across all four research areas is the same: the AI reports got the causes right and invented the thresholds. That suggests the app should teach people which cause to check, and take every number from the powder's own data sheet, rather than ship fixed values. The one real exception, the 1 megohm ground limit, is a safety requirement printed by an equipment maker, which is a useful model for what a trustworthy number looks like.

Open items worth a follow-up: the exact ASTM D7803 preheat figures, current official Qualicoat text (we read a secondary copy), and any equipment-maker booth humidity figure. Nothing found addresses Indian conditions specifically, so the monsoon dew-point and humidity points remain reasoning, not evidence.
