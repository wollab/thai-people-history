import { readFile } from "node:fs/promises";

const expectedPeriods = ["2460-2475", "2475-2500", "2500-2516", "2516-2535", "2535-2549", "2549-2560"];
const allowedVerification = new Set(["verified", "corroborated"]);
const allowedImpact = new Set(["contextual", "documented"]);
const sensitivePattern = /รัฐประหาร|ความรุนแรง|14 ตุลา|6 ตุลา|พฤษภาคม 2535|เปลี่ยนแปลงการปกครอง/;

const history = JSON.parse(await readFile(new URL("../src/data/history.json", import.meta.url), "utf8"));
const researchIndex = JSON.parse(await readFile(new URL("../src/data/research-index.json", import.meta.url), "utf8"));
const syntheses = JSON.parse(await readFile(new URL("../src/data/syntheses.json", import.meta.url), "utf8"));
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
}

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
  if (count < 8) errors.push(`period ${period}: microhistory มีเพียง ${count} เรื่อง (ขั้นต่ำรุ่น 50% คือ 8)`);
}

const patternIds = new Set(researchIndex.patterns.map((pattern) => pattern.id));
for (const story of syntheses.stories ?? []) {
  for (const field of ["title", "deck", "claim", "limits", "status"]) {
    if (!story[field]) errors.push(`synthesis ${story.id}: ไม่มี ${field}`);
  }
  for (const id of story.evidenceIds ?? []) if (!microhistoryIndex.has(id)) errors.push(`synthesis ${story.id}: ไม่พบ microhistory ${id}`);
  for (const id of story.sourceIds ?? []) if (!sources.has(id)) errors.push(`synthesis ${story.id}: ไม่พบ source ${id}`);
  for (const id of story.patternIds ?? []) if (!patternIds.has(id)) errors.push(`synthesis ${story.id}: ไม่พบ pattern ${id}`);
}
if ((syntheses.stories?.length ?? 0) < 6) errors.push(`synthesis มีเพียง ${syntheses.stories?.length ?? 0} เรื่อง (ขั้นต่ำรุ่น 50% คือ 6)`);
if ((researchIndex.coverage.singleSourceSensitiveEvents?.length ?? 0) > 0) errors.push(`research index ยังมี sensitive event แหล่งเดียว: ${researchIndex.coverage.singleSourceSensitiveEvents.join(", ")}`);
for (const id of researchIndex.coverage.eventsWithoutMicrohistory ?? []) if (!events.has(id)) errors.push(`coverage อ้าง event ที่ไม่มีจริง ${id}`);

console.log(`ตรวจแล้ว: ${history.events.length} เหตุการณ์ | ${history.microhistories?.length ?? 0} microhistory | ${history.sources.length} แหล่งอ้างอิง | ${history.worldContexts.length} บริบทโลก | ${syntheses.stories?.length ?? 0} บทสังเคราะห์`);
console.log(Object.entries(periodCounts).map(([period, count]) => `${period}: ${count}`).join(" | "));
for (const warning of warnings) console.warn(`คำเตือน: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`ข้อผิดพลาด: ${error}`);
  process.exit(1);
}
