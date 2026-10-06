# Powder reclaim, blooming and non-metallic clouding: claim verification

(Tooling note: WebFetch returns model-summarised page text, so "exact wording" below is as relayed by the fetch tool; re-check against the page before quoting verbatim in print. Nordson, Gema manuals, PPG, AkzoNobel, Sherwin-Williams, Jotun primary pages were not retrievable or had no relevant text; see Gaps.)

## Claim 1: Reclaim practice (70/30, 40-50% ceiling, 150 um sieve, same powder, metallics, moisture)

### Takeaway
70/30 virgin:reclaim is CONFIRMED, but the sources are an independent consultant (Kevin Biller, "Ask Joe Powder", published via PCI and hosted by Gema) and TIGER Drylac, not Nordson. "Not above 40-50%" is DISPUTED: the sources found cap reclaim at 30%. A 150 um sieve, "same powder only", "metallics 90/10" and "old reclaim absorbs moisture" were not found in any source retrieved (UNSOURCED here).

### Cited Findings
- 70/30 virgin:reclaim, and a hard cap of 30% reclaim. CONFIRMED (attribution to Nordson not confirmed). Wording: "never exceed a 30% reclaim to virgin powder ratio"; also "the reclaimed powder should be added with fresh powder at a ratio 70/30 or 60/40"; "Only introduce a low level of reclaim to the virgin powder". Kevin Biller, Powder Coating Research Group, Ask Joe Powder, June 2022 (Gema-hosted PDF) — [Gema PDF](https://www.gemapowdercoating.com/fileadmin/documents/Sonstige_PDF-Dateien/Ask_Joe_Powder/Ask-Joe-Powder-Jun-2022.pdf); [PCI, "Using reclaimed powder", 7 Jun 2022](https://www.pcimag.com/articles/110185-using-reclaimed-powder). Note: the "70/30 or 60/40" phrase is in the questioner's text per the ChemQuest copy; the "never exceed 30%" is Biller's answer. ChemQuest repost dated 20 Jun 2025: "Less is always better, but it is never wise to exceed a 30% reclaim to virgin powder ratio." — [ChemQuest](https://chemquest.com/ask-joe-powder/reclaimed-powder-transfer-efficiency/)
- TIGER Drylac (maker), metallic powders: "The ratio of virgin powder should not fall short of 70%." and "consistent recycling percentages (guideline: 30%)". — [TIGER Drylac Metallics OFI (US)](https://www.tiger-coatings.com/fileadmin/user_upload/downloads_na_new/technical-information-sheets/tiger-drylac/US/TIGER_Drylac_Metallics_OFI.pdf). This is the only maker number found; it is for metallics, so metallics are not stated to be lower than 70/30 here.
- Axalta (maker) metallic troubleshooting checklist: "ensure that the ratio of virgin powder to reclaim meets the powder manufacturers recommendations" (no number). Data-sheet-wins principle supported. — [Axalta powder FAQ](https://www.axalta.com/powder_us/en_US/technical/frequently-asked-questions/specific-characteristics-metallic-powders.html)
- Sieve: the only number found is "sifting the powder through a relatively coarse screen (80 mesh or 175 microns)", in the context of dry-blend additive treatment of reclaim (Biller, same Gema/PCI sources). This does not confirm 150 um; it is a different value and a different purpose (blending additive).
- Fresh powder particle size context: "5 microns to 80 microns, D50=28 microns" (Biller, same source).
- Kabe/Bubenhofer defect guide lists "Separation during recovery (add fresh powder continuously)" as a clouding cause for metallics/dry-blends. — [Kabe PDF](https://www.kabe-farben.ch/fileadmin/kabe-farben/pulverlack/pul_brochures/2026_01Beschichtungsfehler_erkennen_und_vermeiden_EN_web.pdf)

### Inferences
- "40-50%" is likely from a different tradition (some plants run higher on non-metallic solids with good control) but no retrieved source states it; recommend writing "30% maximum is the commonly quoted consultant/maker guideline; follow the data sheet".
- "90/10 for metallics" is stricter than TIGER's own 70/30 for metallics; treat as UNSOURCED, possibly practice for bonded metallics.

### Gaps
- No Nordson, Gema manual, PPG, AkzoNobel, Sherwin-Williams or Jotun page with a reclaim ratio was retrieved (PPG education page had no ratio text; Nordson search returned nothing usable).
- "Reclaim must be same powder" and "old reclaim absorbs moisture": no source retrieved. Likely true in practice but UNSOURCED here.
- TIGER Europe metallic PDF (pim.tiger-coatings.com download 164750) redirected and was not read.

## Claim 2: Blooming

### Takeaway
Blooming as a white/hazy film is CONFIRMED, with two distinct mechanisms in the sources: polyester oligomer exudation (Biller) and inferior resin / low cure temperature on thick metal (IFS). "Wipes off" is confirmed by two sources as often true, but is a symptom, not a diagnostic test. "Under-cure causes bloom" is DISPUTED between sources: Diamond Vogel and IFS say faster/hotter heat-up prevents it; Biller says it comes from long exposure at elevated, not high, temperature and slow cooling on thick parts. Overbake, gas fumes and mixed chemistries are UNSOURCED here.

### Cited Findings
- "Blooming is a white haze that develops on the surface of a coating." "It can often be removed by wiping down the part after it is cured, but that can be labor intensive and costly." Fixes: "increase the temperature at which the oven is set for baking so the haze cannot develop before the paint sets" or "ask your coating supplier to provide a blooming-resistant formulation". Danielle Dykstra, Diamond Vogel, Products Finishing, 1 Apr 2019 — [PF Online](https://pfonline.com/articles/what-is-blooming-in-powder-coating-and-how-do-i-prevent-it). Does not mention humidity.
- "Blooming looks like a foggy, hazy or smoky distortion in the resin"; mostly on darker colours; from inferior resin or curing at inadequate temperature, particularly on thicker substrates; "Occasionally, high humidity causes, or contributes, to blooming as well."; whitish residue can often be wiped away with a wet cloth; fix: raise oven temperature so metal heats faster, or ask supplier for another resin. Fiona Levin-Smith, IFS Coatings, 17 Aug 2022 — [Finishing and Coating](https://finishingandcoating.com/index.php/powder-coat/1233-fixing-appearance-issues-when-powder-coating-jobs-go-wrong)
- Mechanism: "This occurs with some polyester powder formulas when the coating is exposed to an elevated but not necessarily high temperature for a long period of time." The thick parts "take a long period to cool", allowing "the polyester resin to exude a cyclic oligomer". Cured 375 F for 23 min in the case. Advice: do not quench or force-cool; "contact your powder coating supplier and have them provide a non-blooming polyester powder coating." Kevin Biller, Ask Joe Powder, 2 Apr 2024 — [Polymers Paint Colour Journal](https://polymerspaintcolourjournal.com/?p=18510); [ChemQuest](https://chemquest.com/ask-joe-powder/powder-coating-haze/). Patent literature also exists on non-blooming polyester powder: [US5880223](https://patents.google.com/patent/US5880223).
- Wax/flow-additive migration as the cause: not stated in the pages read. UNSOURCED here.

### Inferences
- "Wipes off" is not a reliable test: two sources say it often wipes off, but wiping removes oligomer, wax or amine blush alike, and a wiped surface may re-bloom on cooling. Use it only as a hint; confirm with supplier, solvent-rub cure test (MEK) and data-sheet cure check.
- Both Dykstra and Biller point to supplier reformulation as the real fix; IFS's "inadequate temperature" and Biller's "long time at moderate temperature" conflict on direction. The report should not say "under-cure causes bloom" flatly.

### Gaps
- Amine/DICY bloom in epoxy and hybrid powders and "greasy surface": the search found only liquid-epoxy amine blush articles (PCI amine blush, not powder-specific), no powder-maker source. UNSOURCED for thermoset powder.
- Gas-oven fumes, mixed chemistries, overbake as bloom causes: no source retrieved.

## Claim 3: Non-metallic clouding

### Takeaway
Makers use "clouding" almost entirely for metallic/effect powders (irregular light-dark effect). Applicator causes (film thickness variation, uneven charging, earthing, fluidisation, gun distance, sine curve) are CONFIRMED by Axalta and Kabe, but for metallics. Non-metallic use is not directly supported; hopper fluidisation and reclaim ratio are named only as general/metallic causes. The "corrosion carbon layer" meaning was not found in any source.

### Cited Findings
- Axalta: "Appearance of irregular light dark effects on substrate"; causes "Wrong space between sprayguns, different charging, improper sine curve, insufficient earthing", "Obviously different film thicknesses"; remedy "Minimise variations in film thickness". (Metallic powder checklist) — [Axalta](https://www.axalta.com/powder_us/en_US/technical/frequently-asked-questions/specific-characteristics-metallic-powders.html)
- Kabe/Bubenhofer (Swiss powder supplier): Clouding = "Non-uniform visual effects with metallic powders and uneven gloss levels when using dry-blend powders." Causes: gun-object distance too small, manual recoating, uneven charging, fluctuating layer thickness, separation during recovery, uneven powder delivery (check fluidising system), sine curve not ideal. — [Kabe PDF](https://www.kabe-farben.ch/fileadmin/kabe-farben/pulverlack/pul_brochures/2026_01Beschichtungsfehler_erkennen_und_vermeiden_EN_web.pdf)
- TIGER Drylac: "Coating thickness is of importance as variations will cause color/effect and gloss differences."; "proper grounding of equipment as well as work piece is very important"; "a subsequent touch-up job may produce clouding". — [TIGER Metallics OFI](https://www.tiger-coatings.com/fileadmin/user_upload/downloads_na_new/technical-information-sheets/tiger-drylac/US/TIGER_Drylac_Metallics_OFI.pdf)
- Glasurit "clouding" page appeared in search but is liquid automotive paint, not powder (not read).

### Inferences
- Gloss patchiness on non-metallic solids is likely driven by the same film-thickness and cure-uniformity factors, but this is inference; no source retrieved says so.
- Reclaim ratio as a clouding cause appears only via "separation during recovery" (metallic/dry-blend) and TIGER's consistent-percentage guideline.

### Gaps
- "Cloud" meaning corrosion "carbon layer": no source found. Not verified.
- No non-metallic-specific clouding source from a maker.

## Claim 4: "Raise oven temperature about 5 C" for haze

### Takeaway
DISPUTED / UNSOURCED as a number. Sources say raise oven temperature (Dykstra, IFS) but give no "5 C" figure; they speak of faster metal heat-up. Cure is defined at metal temperature per data sheet.

### Cited Findings
- "The cure time listed on your powder formulator's data sheet is the time at metal temperature." Oven dwell = bring-up time + cure time; any point on the maker's cure curve gives full cure. — [PF Online, Curing Temps and Times](https://pfonline.com/articles/curing-temps-and-times) (author/date not captured)
- IFS: raise oven temperature "so metal heats faster and reaches proper cure temperatures more quickly" — [Finishing and Coating](https://finishingandcoating.com/index.php/powder-coat/1233-fixing-appearance-issues-when-powder-coating-jobs-go-wrong)
- Biller notes bloom is tied to long time at moderate temperature on thick parts, so extra oven set-point alone can lengthen heat exposure. — [Polymers Paint Colour Journal](https://polymerspaintcolourjournal.com/?p=18510)

### Inferences
- Safer wording: measure part (PMT) with a data logger, confirm it reaches the data-sheet temperature, shorten bring-up on heavy sections, stay within the data sheet's cure window, and ask the supplier for a non-blooming grade. Do not give a fixed 5 C.

### Gaps
- No source states "5 C". No Talbert/Liberto article read directly on this point.
