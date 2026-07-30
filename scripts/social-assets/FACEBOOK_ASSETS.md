# Facebook Page Assets

Final files:

- `public/social/facebook-page/facebook-profile.png` - 640 x 640 PNG
- `public/social/facebook-page/facebook-cover.png` - 1640 x 924 PNG, 16:9
- `public/social/facebook-page/facebook-profile-v2.png` - Thai-print revision, 640 x 640 PNG
- `public/social/facebook-page/facebook-cover-v2.png` - Thai everyday-life revision, 1640 x 924 PNG, 16:9
- `public/social/facebook-page/facebook-profile-v3.png` - full Thai Page-name lockup, 640 x 640 PNG
- `public/social/facebook-page/facebook-profile-v4-condensed.png` - Noto Sans Thai Extra Condensed lockup, 640 x 640 PNG
- `public/social/facebook-page/facebook-profile-v5-years.png` - compact `100 ปี / 2460 / 2560` lockup, 640 x 640 PNG
- `public/social/facebook-page/facebook-cover-v3-condensed.png` - matching condensed cover, 1640 x 924 PNG, 16:9

Recommended condensed set: use `facebook-profile-v5-years.png` with `facebook-cover-v3-condensed.png`. The profile lets the Page name carry the identity while the image communicates the 100-year scope at small sizes. Exact text is rendered with the locally bundled Noto Sans Thai variable font at width `62.5` and weight `800`.

Source files:

- `facebook-profile-source.png` - generated emblem without text
- `facebook-cover-background.png` - generated editorial collage without text
- `facebook-profile-v2-source.png` - revised Thai shop-calendar and newspaper emblem
- `facebook-cover-v2-background.png` - revised Thai everyday-life collage without text
- `scripts/social-assets/facebook-assets-render.html` - deterministic Thai title and export layout
- `scripts/social-assets/fonts/NotoSansThai-Variable.ttf` - Google Fonts variable font with `wdth 62.5-100` and `wght 100-900`
- `scripts/social-assets/fonts/OFL-NotoSansThai.txt` - SIL Open Font License

## Direction

The visual system combines a Chinese tear-off calendar with a Thai newspaper archive. It uses the website palette: rice paper, ink black, vermilion, deep jade, and restrained mustard.

The profile image avoids text so it remains recognizable in Facebook's circular crop at small sizes. The cover keeps the title in the central safe area and leaves the lower-left region low-detail because Facebook may overlap that area with the profile picture.

## Generation Prompts

Profile: a centered geometric emblem combining a vermilion tear-off calendar page, a folded black newspaper, and a deep-jade circular seal; flat editorial letterpress and screen-print style; no words, letters, numerals, flags, royal imagery, political portraits, or watermark.

Cover: a wide 16:9 Thai editorial collage across one hundred years of everyday life, using railway, market, classroom, radio, factory, rice, early computer, and city-bus motifs; quiet central paper area for title overlay; letterpress, woodcut, risograph, and halftone treatment; no readable generated text or political symbols.

Exact public copy is rendered separately:

- `คลังความรู้สาธารณะ`
- `ประวัติศาสตร์ประชาชนไทย`
- `พ.ศ. 2460–2560`
- `๑๐๐ ปี` on the revised profile emblem
