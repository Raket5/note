// ===== STATE =====
let sections   = [];
let activeSecId = null;

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  ["docTitle", "docClass", "docSubject"].forEach(id =>
    document.getElementById(id).addEventListener("input", updatePageHeader)
  );
  ["teacherName", "teacherDesig", "watermarkText"].forEach(id =>
    document.getElementById(id).addEventListener("input", onInfoChange)
  );
  document.getElementById("showWatermark").addEventListener("change", updateWatermarks);
  document.getElementById("showSignature").addEventListener("change", updateSignature);

  updatePageHeader();
  onInfoChange();
});

// ===== HEADER =====
function updatePageHeader() {
  const title   = document.getElementById("docTitle").value.trim();
  const cls     = document.getElementById("docClass").value.trim();
  const subject = document.getElementById("docSubject").value.trim();
  const teacher = document.getElementById("teacherName").value.trim() || "S. M. Mahmud Hasan";
  const desig   = document.getElementById("teacherDesig").value.trim() || "Assistant Teacher";

  document.getElementById("pageSchoolSub").innerHTML =
    `Subject Teacher: ${esc(teacher)} &nbsp;|&nbsp; ${esc(desig)}`;

  const titleEl = document.getElementById("pageTitleDisplay");
  if (title) { titleEl.textContent = title; titleEl.style.display = "block"; }
  else        { titleEl.textContent = "";    titleEl.style.display = "none";  }

  const metaEl = document.getElementById("pageMetaDisplay");
  const parts  = [];
  if (cls)     parts.push(`<span><b>Class:</b> ${esc(cls)}</span>`);
  if (subject) parts.push(`<span><b>Subject:</b> ${esc(subject)}</span>`);
  if (parts.length) { metaEl.innerHTML = parts.join(""); metaEl.style.display = "flex"; }
  else              { metaEl.innerHTML = "";             metaEl.style.display = "none";  }

  // Footer
  document.getElementById("footerLeft").textContent =
    `Bangladesh Navy School And College, CTG — ${teacher}`;
}

function onInfoChange() {
  updatePageHeader();
  updateWatermarks();
  updateSignature();
}

// ===== WATERMARKS =====
function updateWatermarks() {
  const text = document.getElementById("watermarkText").value.trim() || "Mahmud Sir";
  const show = document.getElementById("showWatermark").checked;
  ["wmTL","wmTR","wmBL","wmBR","wmCenter"].forEach(id => {
    const el = document.getElementById(id);
    el.textContent = text;
    el.classList.toggle("wm-hidden", !show);
  });
}

// ===== SIGNATURE =====
function updateSignature() {
  const show   = document.getElementById("showSignature").checked;
  const teacher = document.getElementById("teacherName").value.trim() || "S. M. Mahmud Hasan";
  const desig   = document.getElementById("teacherDesig").value.trim() || "Assistant Teacher";
  const el      = document.getElementById("pageSignature");
  if (show) {
    el.innerHTML = `
      <div class="page-signature">
        <div class="sig-line"></div>
        <div class="sig-name">${esc(teacher)}</div>
        <div class="sig-desig">${esc(desig)}</div>
      </div>`;
  } else {
    el.innerHTML = "";
  }
}

// ===== SECTIONS =====
function addSection() {
  const title = prompt("Section title (optional):", "") ?? "";
  const id    = "sec_" + Date.now();
  sections.push({ id, title: title.trim() });
  renderSectionList();
  appendSectionDOM(sections[sections.length - 1]);
  focusSection(id);
}

function appendSectionDOM(sec) {
  const body = document.getElementById("pageBody");
  document.getElementById("noSectionHint").style.display = "none";

  const div = document.createElement("div");
  div.className = "doc-section";
  div.id = "ds_" + sec.id;
  div.innerHTML = `
    <div class="doc-section-header">
      <input type="text"
        class="doc-section-title-input"
        placeholder="Section title (optional)"
        value="${escAttr(sec.title)}"
        oninput="updateSectionTitle('${sec.id}', this.value)"
      />
      <button class="btn-del-sec" onclick="deleteSection('${sec.id}')" title="Delete section">✕</button>
    </div>
    <div class="doc-section-editor"
      id="ed_${sec.id}"
      contenteditable="true"
      spellcheck="true"
      data-placeholder="এখানে লিখুন..."
      onfocus="activeSecId='${sec.id}'; renderSectionList();"
    ></div>`;
  body.appendChild(div);
}

function deleteSection(id) {
  if (!confirm("Delete this section?")) return;
  sections = sections.filter(s => s.id !== id);
  document.getElementById("ds_" + id)?.remove();
  if (activeSecId === id) activeSecId = sections.length ? sections[sections.length-1].id : null;
  renderSectionList();
  if (!sections.length) document.getElementById("noSectionHint").style.display = "flex";
}

function focusSection(id) {
  activeSecId = id;
  renderSectionList();
  const ed = document.getElementById("ed_" + id);
  if (!ed) return;
  ed.focus();
  const range = document.createRange();
  const sel   = window.getSelection();
  range.selectNodeContents(ed);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

function updateSectionTitle(id, val) {
  const sec = sections.find(s => s.id === id);
  if (sec) sec.title = val;
  renderSectionList();
}

function renderSectionList() {
  const list = document.getElementById("sectionList");
  if (!sections.length) {
    list.innerHTML = '<p class="empty-hint">No sections. Click "+ Add".</p>';
    return;
  }
  list.innerHTML = sections.map(s => `
    <div class="sec-item ${activeSecId === s.id ? 'active' : ''}"
         onclick="focusSection('${s.id}')">
      <div class="sec-item-name">${esc(s.title || "(No title)")}</div>
      <div>
        <button class="btn-sm" onclick="deleteSection('${s.id}');event.stopPropagation();" title="Delete">🗑</button>
      </div>
    </div>`).join("");
}

// ===== TOOLBAR =====
function execCmd(cmd, value) {
  document.execCommand(cmd, false, value ?? null);
  getActiveEditor()?.focus();
}

function getActiveEditor() {
  if (activeSecId) return document.getElementById("ed_" + activeSecId);
  return document.querySelector(".doc-section-editor:focus");
}

function insertHeading(tag) {
  const ed = getActiveEditor();
  if (!ed) return;
  ed.focus();
  document.execCommand("formatBlock", false, tag);
}

// ===== PREVIEW =====
let previewMode = false;
function togglePreview() {
  previewMode = !previewMode;
  document.body.classList.toggle("preview-mode", previewMode);
  document.querySelector(".btn-preview-toggle").textContent =
    previewMode ? "✏️ Edit Mode" : "👁 Toggle Preview";
}

// ===== PDF =====
function downloadPDF() { window.print(); }

// ===== WORD =====
function downloadDOCX() {
  const title   = document.getElementById("docTitle").value.trim() || "Sheet";
  const cls     = document.getElementById("docClass").value.trim();
  const subject = document.getElementById("docSubject").value.trim();
  const teacher = document.getElementById("teacherName").value.trim() || "S. M. Mahmud Hasan";
  const desig   = document.getElementById("teacherDesig").value.trim() || "Assistant Teacher";
  const sig     = document.getElementById("showSignature").checked;

  let bodyHTML = "";
  sections.forEach(sec => {
    const ed = document.getElementById("ed_" + sec.id);
    if (!ed) return;
    if (sec.title)
      bodyHTML += `<h2 style="font-size:11pt;font-weight:700;color:#0f1f45;border-bottom:1pt solid #0f1f45;margin:14pt 0 6pt;padding-bottom:2pt;">${esc(sec.title)}</h2>`;
    bodyHTML += `<div style="font-size:10.5pt;line-height:1.85;margin-bottom:12pt;">${ed.innerHTML}</div>`;
  });

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <style>
    body{font-family:'Noto Serif Bengali','Times New Roman',serif;margin:2cm 2.5cm;font-size:10.5pt;}
    h1{font-size:13pt;text-align:center;color:#0f1f45;font-family:'Playfair Display','Times New Roman',serif;}
    h2{font-size:11pt;font-weight:700;color:#0f1f45;border-bottom:1pt solid #0f1f45;margin:14pt 0 6pt;padding-bottom:2pt;}
    .meta{text-align:center;font-size:9pt;color:#555;border-bottom:2pt solid #0f1f45;padding-bottom:8pt;margin-bottom:14pt;}
    .gold{width:60pt;height:2pt;background:#c9a84c;margin:6pt auto;}
    .sig{margin-top:36pt;}
    .sig-line{width:130pt;border-bottom:1pt solid #333;margin-bottom:4pt;}
    .sig-name{font-size:8.5pt;font-weight:600;color:#333;}
    .sig-desig{font-size:7.5pt;color:#666;}
    .footer{font-size:8pt;color:#aaa;border-top:1pt solid #eee;padding-top:4pt;margin-top:16pt;}
  </style></head><body>
  <h1>Bangladesh Navy School And College, CTG</h1>
  <div class="meta">
    Subject Teacher: ${esc(teacher)} | ${esc(desig)}<br/>
    <div class="gold"></div>
    ${title ? `<strong>${esc(title)}</strong><br/>` : ""}
    ${cls ? `Class: ${esc(cls)}` : ""}${subject ? ` | Subject: ${esc(subject)}` : ""}
  </div>
  ${bodyHTML}
  ${sig ? `<div class="sig"><div class="sig-line"></div><div class="sig-name">${esc(teacher)}</div><div class="sig-desig">${esc(desig)}</div></div>` : ""}
  <div class="footer">Bangladesh Navy School And College, CTG — ${esc(teacher)}</div>
  </body></html>`;

  const blob = new Blob(["\ufeff" + html], { type: "application/msword" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = title + ".doc"; a.click();
  URL.revokeObjectURL(url);
}

// ===== UTILS =====
function esc(s) {
  return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function escAttr(s) {
  return esc(s).replace(/'/g,"&#39;");
}
