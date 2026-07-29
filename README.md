# Thai People History Web

Public website prototype for the Thai people history project covering B.E. 2460-2560.

## Status

- Prototype only
- Historical summaries are research questions and context candidates, not final claims
- Public-domain and CC0 images are documented in `public/images/ATTRIBUTION.md`
- Current research completion and first-release targets are documented in `RESEARCH_PROGRESS.md`

## Public routes

- `/archive/` ค้นและกรองเหตุการณ์กับ microhistory
- `/reading/` อ่านบทสังเคราะห์พร้อม evidence trail
- `/explore/` สำรวจ timeline ไทย-โลก กลไกการเปลี่ยนแปลง และ coverage ของหลักฐาน
- `/sources/` ตรวจบรรณานุกรมและสถานะการเข้าถึงลิงก์
- `/gaps/` ดูคำถามและเสียงที่ฐานยังขาด

## Local development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run build
```

## Publication model

The research knowledge base remains the source of truth. Only reviewed, public-safe records should be promoted into this website.

Public-facing copy follows `PUBLIC_WEB_WRITING_STANDARD.md`: write for visitors using the site, while keeping implementation status, developer workflow, and handoff language in repository documentation.
