import { readFile } from "node:fs/promises";

const expectedPeriods = ["2460-2475", "2475-2500", "2500-2516", "2516-2535", "2535-2549", "2549-2560"];
const allowedVerification = new Set(["verified", "corroborated"]);
const allowedImpact = new Set(["contextual", "documented"]);
const sensitivePattern = /รัฐประหาร|ความรุนแรง|14 ตุลา|6 ตุลา|พฤษภาคม 2535|เปลี่ยนแปลงการปกครอง/;

const history = JSON.parse(await readFile(new URL("../src/data/history.json", import.meta.url), "utf8"));
const researchIndex = JSON.parse(await readFile(new URL("../src/data/research-index.json", import.meta.url), "utf8"));
const syntheses = JSON.parse(await readFile(new URL("../src/data/syntheses.json", import.meta.url), "utf8"));
const sourceLabels = JSON.parse(await readFile(new URL("../src/data/source-labels.json", import.meta.url), "utf8"));
const sourceIntegrity = JSON.parse(await readFile(new URL("../src/data/source-integrity.json", import.meta.url), "utf8"));
const qualityIndicators = JSON.parse(await readFile(new URL("../src/data/quality-indicators.json", import.meta.url), "utf8"));
const errors = [];
const warnings = [];

const uniqueIndex = (items, label) => {
  const index = new Map();
  for (const item of items ?? []) {
    if (!item.id) errors.push(`${label}: พบรายการไม่มี id`);
    else if (index.has(item.id)) errors.push(`${label}: id ซ้ำ ${item.id}`);
    else index.set(item.id, item);
  }
  return index;
};

const sources = uniqueIndex(history.sources, "source");
const contexts = uniqueIndex(history.worldContexts, "worldContext");
const events = uniqueIndex(history.events, "event");
const microhistoryIndex = uniqueIndex(history.microhistories, "microhistory");

for (const source of history.sources ?? []) {
  try { new URL(source.url); } catch { errors.push(`source ${source.id}: URL ไม่ถูกต้อง`); }
  for (const field of ["title", "publisher", "type", "language"]) {
    if (!source[field]) errors.push(`source ${source.id}: ไม่มี ${field}`);
  }
  if (!sourceLabels.sourceTypes[source.type]) errors.push(`source ${source.id}: ไม่มีป้ายภาษาไทยสำหรับ type ${source.type}`);
  if (!sourceLabels.languages[source.language]) errors.push(`source ${source.id}: ไม่มีป้ายภาษาสำหรับ ${source.language}`);
}
const sourcesWithAccessDate = history.sources.filter((source) => source.accessed).length;
if (sourcesWithAccessDate < history.sources.length) warnings.push(`source ${history.sources.length - sourcesWithAccessDate} แหล่งยังไม่มีวันที่เข้าถึงใน canonical metadata`);

if (sourceIntegrity.meta.sourceDatabaseVersion !== history.meta.version) errors.push(`source integrity version ${sourceIntegrity.meta.sourceDatabaseVersion} ไม่ตรงกับ history ${history.meta.version}`);
if (sourceIntegrity.results.length !== history.sources.length) errors.push(`source integrity มี ${sourceIntegrity.results.length} รายการ แต่ source มี ${history.sources.length}`);
for (const result of sourceIntegrity.results) if (!sources.has(result.id)) errors.push(`source integrity อ้าง source ที่ไม่มีจริง ${result.id}`);
if (sourceIntegrity.summary.broken > 0) errors.push(`source integrity ยังมีลิงก์เสีย ${sourceIntegrity.summary.broken} รายการ`);
if (sourceIntegrity.summary.unverified > 0) warnings.push(`source link ${sourceIntegrity.summary.unverified} รายการยังต้องตรวจซ้ำ`);

for (const context of history.worldContexts ?? []) {
  for (const sourceId of context.sourceIds ?? []) {
    if (!sources.has(sourceId)) errors.push(`worldContext ${context.id}: ไม่พบ source ${sourceId}`);
  }
}

const periodCounts = Object.fromEntries(expectedPeriods.map((period) => [period, 0]));
for (const event of history.events ?? []) {
  if (!(event.period in periodCounts)) errors.push(`event ${event.id}: period ไม่อยู่ในกรอบ ${event.period}`);
  else periodCounts[event.period] += 1;

  for (const field of ["beYear", "ceYear", "title", "summary", "peopleImpact", "openQuestion"]) {
    if (!event[field]) errors.push(`event ${event.id}: ไม่มี ${field}`);
  }
  if (!allowedVerification.has(event.verification)) errors.push(`event ${event.id}: verification ไม่ถูกต้อง`);
  if (!allowedImpact.has(event.impactStatus)) errors.push(`event ${event.id}: impactStatus ไม่ถูกต้อง`);
  if (!event.themes?.length) errors.push(`event ${event.id}: ไม่มี theme`);
  if (!event.sourceIds?.length) errors.push(`event ${event.id}: ไม่มี source`);

  for (const sourceId of event.sourceIds ?? []) {
    if (!sources.has(sourceId)) errors.push(`event ${event.id}: ไม่พบ source ${sourceId}`);
  }
  for (const contextId of event.worldContextIds ?? []) {
    if (!contexts.has(contextId)) errors.push(`event ${event.id}: ไม่พบ worldContext ${contextId}`);
  }

  const beStart = Number(event.beYear.match(/\d{4}/)?.[0]);
  const ceStart = Number(event.ceYear.match(/\d{4}/)?.[0]);
  if (!beStart || !ceStart || beStart - 543 !== ceStart) {
    errors.push(`event ${event.id}: ปี พ.ศ./ค.ศ. ไม่ตรงกัน (${event.beYear}/${event.ceYear})`);
  }

  if (sensitivePattern.test(event.title) && event.sourceIds.length < 2) {
    warnings.push(`event ${event.id}: เหตุการณ์อ่อนไหวมีแหล่งอ้างอิงเพียง 1 แหล่ง ควรค้นเพิ่มก่อนเขียนบทสรุปเชิงลึก`);
  }
}

for (const [period, count] of Object.entries(periodCounts)) {
  if (count < 6) errors.push(`period ${period}: มีเพียง ${count} เหตุการณ์ (ขั้นต่ำ 6)`);
}

const allowedEvidenceStatus = new Set(["documented-case", "contextual-lead", "research-lead"]);
const mhPeriodCounts = Object.fromEntries(expectedPeriods.map((period) => [period, 0]));
for (const record of history.microhistories ?? []) {
  if (!(record.period in mhPeriodCounts)) errors.push(`microhistory ${record.id}: period ไม่อยู่ในกรอบ ${record.period}`);
  else mhPeriodCounts[record.period] += 1;

  for (const field of ["beYear", "ceYear", "title", "fact", "livedExperience", "openQuestion"]) {
    if (!record[field]) errors.push(`microhistory ${record.id}: ไม่มี ${field}`);
  }
  for (const field of ["groups", "location", "everydayDimensions", "sourceIds", "missingVoices"]) {
    if (!record[field]?.length) errors.push(`microhistory ${record.id}: ${field} ว่างเปล่า`);
  }
  if (!allowedEvidenceStatus.has(record.evidenceStatus)) errors.push(`microhistory ${record.id}: evidenceStatus ไม่ถูกต้อง`);
  for (const sourceId of record.sourceIds ?? []) {
    if (!sources.has(sourceId)) errors.push(`microhistory ${record.id}: ไม่พบ source ${sourceId}`);
  }
  for (const eventId of record.linkedEventIds ?? []) {
    if (!history.events.some((event) => event.id === eventId)) errors.push(`microhistory ${record.id}: ไม่พบ event ${eventId}`);
  }
  const beStart = Number(record.beYear.match(/\d{4}/)?.[0]);
  const ceStart = Number(record.ceYear.match(/\d{4}/)?.[0]);
  if (!beStart || !ceStart || beStart - 543 !== ceStart) {
    errors.push(`microhistory ${record.id}: ปี พ.ศ./ค.ศ. ไม่ตรงกัน (${record.beYear}/${record.ceYear})`);
  }
}
for (const [period, count] of Object.entries(mhPeriodCounts)) {
  if (count < 18) errors.push(`period ${period}: microhistory มีเพียง ${count} เรื่อง (ขั้นต่ำรุ่น 100% คือ 18)`);
}

if (history.events.length < 80) errors.push(`event มีเพียง ${history.events.length} เรื่อง (ขั้นต่ำรุ่น 100% คือ 80)`);
if (history.microhistories.length < 120) errors.push(`microhistory มีเพียง ${history.microhistories.length} เรื่อง (ขั้นต่ำรุ่น 100% คือ 120)`);
if (history.sources.length < 180) errors.push(`source มีเพียง ${history.sources.length} แหล่ง (ขั้นต่ำรุ่น 100% คือ 180)`);
const documentedCases = history.microhistories.filter((record) => record.evidenceStatus === "documented-case").length;
const researchLeads = history.microhistories.filter((record) => record.evidenceStatus === "research-lead").length;
if (documentedCases < 72) errors.push(`documented-case มีเพียง ${documentedCases} เรื่อง (ขั้นต่ำรุ่น 100% คือ 72)`);
if (researchLeads > 0) errors.push(`ยังมี research-lead ${researchLeads} เรื่องใน public snapshot`);

const patternIds = new Set(researchIndex.patterns.map((pattern) => pattern.id));
uniqueIndex(syntheses.stories ?? [], "synthesis");
const synthesisSlugs = new Set();
for (const story of syntheses.stories ?? []) {
  for (const field of ["title", "deck", "claim", "limits", "status"]) {
    if (!story[field]) errors.push(`synthesis ${story.id}: ไม่มี ${field}`);
  }
  for (const id of story.evidenceIds ?? []) if (!microhistoryIndex.has(id)) errors.push(`synthesis ${story.id}: ไม่พบ microhistory ${id}`);
  for (const id of story.sourceIds ?? []) if (!sources.has(id)) errors.push(`synthesis ${story.id}: ไม่พบ source ${id}`);
  for (const id of story.patternIds ?? []) if (!patternIds.has(id)) errors.push(`synthesis ${story.id}: ไม่พบ pattern ${id}`);
  for (const highlight of story.mediaHighlights ?? []) {
    if (!sources.has(highlight.sourceId)) errors.push(`synthesis ${story.id}: media ไม่พบ source ${highlight.sourceId}`);
    if (!story.sourceIds?.includes(highlight.sourceId)) errors.push(`synthesis ${story.id}: media source ${highlight.sourceId} ไม่อยู่ใน sourceIds`);
    if (!highlight.videoId || !Number.isFinite(highlight.startSeconds) || !highlight.title || !highlight.summary) errors.push(`synthesis ${story.id}: media highlight ข้อมูลไม่ครบ`);
  }
  const slug = story.id.replace(/^syn-/, "");
  if (synthesisSlugs.has(slug)) errors.push(`synthesis slug ซ้ำ ${slug}`);
  synthesisSlugs.add(slug);
}
if ((syntheses.stories?.length ?? 0) < 12) errors.push(`synthesis มีเพียง ${syntheses.stories?.length ?? 0} เรื่อง (ขั้นต่ำรุ่น 100% คือ 12)`);
if ((researchIndex.coverage.singleSourceSensitiveEvents?.length ?? 0) > 0) errors.push(`research index ยังมี sensitive event แหล่งเดียว: ${researchIndex.coverage.singleSourceSensitiveEvents.join(", ")}`);
for (const id of researchIndex.coverage.eventsWithoutMicrohistory ?? []) if (!events.has(id)) errors.push(`coverage อ้าง event ที่ไม่มีจริง ${id}`);
if ((researchIndex.coverage.eventsWithoutMicrohistory?.length ?? 0) > 0) errors.push(`event ที่ยังไม่มี microhistory มี ${researchIndex.coverage.eventsWithoutMicrohistory.length} เรื่อง (รุ่น 100% ต้องเป็น 0)`);

const indicatorIds = new Set();
for (const indicator of qualityIndicators.indicators ?? []) {
  if (indicatorIds.has(indicator.id)) errors.push(`quality indicator id ซ้ำ ${indicator.id}`);
  indicatorIds.add(indicator.id);
  for (const field of ["labelTh", "unitTh", "definitionTh", "interpretationNoteTh", "sourceUrl", "sourceNote", "license"]) {
    if (!indicator[field]) errors.push(`quality indicator ${indicator.id}: ไม่มี ${field}`);
  }
  if (!indicator.values?.length) errors.push(`quality indicator ${indicator.id}: ไม่มีข้อมูลรายปี`);
  let previousYear = 0;
  for (const point of indicator.values ?? []) {
    if (point.beYear - 543 !== point.ceYear) errors.push(`quality indicator ${indicator.id}: ปีไม่ตรงกัน ${point.beYear}/${point.ceYear}`);
    if (point.ceYear <= previousYear) errors.push(`quality indicator ${indicator.id}: ปีไม่เรียงจากเก่าไปใหม่`);
    if (typeof point.value !== "number" || !Number.isFinite(point.value)) errors.push(`quality indicator ${indicator.id}: ค่าไม่ถูกต้องที่ ${point.ceYear}`);
    previousYear = point.ceYear;
  }
}
if (indicatorIds.size < 6) errors.push(`quality indicator มีเพียง ${indicatorIds.size} ชุด (ขั้นต่ำ 6)`);

console.log(`ตรวจแล้ว: ${history.events.length} เหตุการณ์ | ${history.microhistories?.length ?? 0} microhistory | ${history.sources.length} แหล่งอ้างอิง | ${history.worldContexts.length} บริบทโลก | ${syntheses.stories?.length ?? 0} บทสังเคราะห์`);
console.log(`ตัวชี้วัดชีวิต: ${indicatorIds.size} ชุด | ${qualityIndicators.indicators?.reduce((sum, item) => sum + item.values.length, 0) ?? 0} จุดข้อมูล`);
console.log(Object.entries(periodCounts).map(([period, count]) => `${period}: ${count}`).join(" | "));
for (const warning of warnings) console.warn(`คำเตือน: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`ข้อผิดพลาด: ${error}`);
  process.exit(1);
}
