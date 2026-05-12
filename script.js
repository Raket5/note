// ===== STATE =====
let sections = [];   // { id, title }
let activeSecId = null;

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  // Update page header when settings change
  ["docTitle","docClass","docSubject"].forEach(id => {
    document.getElementById(id).addEventListener("input", updatePageHeader);
  });
  document.getElementById("showWatermark").addEventListener("change", updateWatermarks);
  document.getElementById("showPageNum").addEventListener("change", updatePageNum);
  document.getElementById("showSignature").addEventListener("change", updateSignature);

  // Set footer date
  document.getElementById("footerDate").textContent =
    new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });

  updatePageHeader();
  updateWatermarks();
  updateSignature();
  updatePageNum();
});

// ===== PAGE HEADER =====
function updatePageHeader() {
  const title   = document.getElementById("docTitle").value.trim();
  const cls     = document.getElementById("docClass").value.trim();
  const subject = document.getElementById("docSubject").value.trim();

  document.getElementById("pageTitleDisplay").textContent = title;
  document.getElementById("pageTitleDisplay").style.display = title ? "block" : "none";

  const metaEl = document.getElementById("pageMetaDisplay");
  let parts = [];
  if (cls)     parts.push(`<b>Class:</b> ${escHtml(cls)}`);
  if (subject) parts.push(`<b>Subject:</b> ${escHtml(subject)}`);
  metaEl.innerHTML = parts.map(p => `<span>${p}</span>`).join("");
  metaEl.style.display = parts.length ? "flex" : "none";
}

function updateWatermarks() {
  const show = document.getElementById("showWatermark").checked;
  ["wmTL","wmTR","wmBL","wmBR","wmCenter"].forEach(id => {
    document.getElementById(id).classList.toggle("wm-hidden", !show);
  });
}

function updateSignature() {
  const show = document.getElementById("showSignature").checked;
  document.getElementById("pageSignature").style.display = show ? "flex" : "none";
}

function updatePageNum() {
  const show = document.getElementById("showPageNum").checked;
  document.getElementById("pageNumDisplay").style.display = show ? "inline" : "none";
}

// ===== SECTION MANAGEMENT =====
function addSection() {
  const title = prompt("Section title (optional):", "") ?? "";
  const id = "sec_" + Date.now();
  sections.push({ id, title: title.trim() });
  renderSectionList();
  renderPageBody();
  focusSection(id);
}

function deleteSection(id) {
  if (!confirm("Delete this section?")) return;
  sections = sections.filter(s => s.id !== id);
  if (activeSecId === id) activeSecId = sections.length ? sections[0].id : null;
  renderSectionList();
  // Remove DOM section
  const el = document.getElementById("ds_" + id);
  if (el) el.remove();
  if (!sections.length) {
    document.getElementById("noSectionHint").style.display = "flex";
  }
}

function focusSection(id) {
  activeSecId = id;
  renderSectionList();
  const editor = document.getElementById("ed_" + id);
  if (editor) {
    editor.focus();
    // Move caret to end
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(editor);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }
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
    <div class="sec-item ${activeSecId === s.id ? 'active' : ''}" onclick="focusSection('${s.id}')">
      <div class="sec-item-name">${escHtml(s.title || "(No title)")}</div>
      <div class="sec-item-actions">
        <button class="btn-sm" onclick="deleteSection('${s.id}');event.stopPropagation();" title="Delete">🗑</button>
      </div>
    </div>`).join("");
}

// Render all sections into page body (called once per add; incremental after)
function renderPageBody() {
  const body = document.getElementById("pageBody");
  const hint = document.getElementById("noSectionHint");

  // Only add sections that don't exist yet
  sections.forEach(sec => {
    if (document.getElementById("ds_" + sec.id)) return; // already exists
    const div = document.createElement("div");
    div.className = "doc-section";
    div.id = "ds_" + sec.id;
    div.innerHTML = `
      <div class="doc-section-header">
        <input type="text"
          class="doc-section-title-input"
          placeholder="Section title (optional)"
          value="${escHtmlAttr(sec.title)}"
          oninput="updateSectionTitle('${sec.id}', this.value)"
        />
        <button class="btn-del-sec" onclick="deleteSection('${sec.id}')" title="Delete section">✕</button>
      </div>
      <div class="doc-section-editor"
        id="ed_${sec.id}"
        contenteditable="true"
        spellcheck="true"
        data-placeholder="এখানে লিখুন... (টাইপ করুন বা paste করুন)"
        onfocus="activeSecId='${sec.id}';renderSectionList();"
      ></div>`;
    body.appendChild(div);
  });

  if (sections.length) hint.style.display = "none";
}

// ===== RICH TEXT COMMANDS =====
function execCmd(cmd, value) {
  document.execCommand(cmd, false, value ?? null);
  const editor = getActiveEditor();
  if (editor) editor.focus();
}

function getActiveEditor() {
  if (activeSecId) return document.getElementById("ed_" + activeSecId);
  // Fallback: whichever editor is focused
  return document.querySelector(".doc-section-editor:focus");
}

function insertHeading(tag) {
  // Wrap current selection / paragraph in heading
  const editor = getActiveEditor();
  if (!editor) return;
  editor.focus();
  document.execCommand('formatBlock', false, tag);
}

// ===== TOGGLE PREVIEW =====
let previewMode = false;
function togglePreview() {
  previewMode = !previewMode;
  document.body.classList.toggle("preview-mode", previewMode);
  // Update button label
  const btn = document.querySelector(".btn-preview-toggle");
  btn.textContent = previewMode ? "✏️ Edit Mode" : "👁 Toggle Preview";
}

// ===== PDF DOWNLOAD =====
function downloadPDF() {
  window.print();
}

// ===== WORD DOWNLOAD =====
function downloadDOCX() {
  const title   = document.getElementById("docTitle").value.trim() || "Sheet";
  const cls     = document.getElementById("docClass").value.trim();
  const subject = document.getElementById("docSubject").value.trim();
  const signature = document.getElementById("showSignature").checked;
  const today = new Date().toLocaleDateString("en-GB");

  // Collect rich HTML from all editors
  let bodyHTML = "";
  sections.forEach(sec => {
    const editor = document.getElementById("ed_" + sec.id);
    if (!editor) return;
    if (sec.title) bodyHTML += `<h2 style="font-size:11pt;font-weight:700;color:#0f1f45;border-bottom:1pt solid #0f1f45;margin:14pt 0 6pt;padding-bottom:2pt;font-family:'Noto Serif Bengali',serif;">${escHtml(sec.title)}</h2>`;
    bodyHTML += `<div style="font-size:10.5pt;line-height:1.85;font-family:'Noto Serif Bengali',serif;margin-bottom:12pt;">${editor.innerHTML}</div>`;
  });

  const wordHTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
    <style>
      body{font-family:'Noto Serif Bengali','Times New Roman',serif;margin:2cm 2.5cm;font-size:10.5pt;color:#000;}
      h1{font-size:13pt;text-align:center;color:#0f1f45;margin-bottom:2pt;font-family:'Playfair Display','Times New Roman',serif;}
      h2{font-size:11pt;font-weight:700;color:#0f1f45;border-bottom:1pt solid #0f1f45;margin:14pt 0 6pt;padding-bottom:2pt;}
      h3{font-size:12pt;color:#0f1f45;margin:8pt 0 3pt;}
      h4{font-size:11pt;color:#1a3a6b;margin:6pt 0 3pt;}
      .meta{text-align:center;font-size:9pt;color:#555;margin-bottom:14pt;border-bottom:2pt solid #0f1f45;padding-bottom:8pt;}
      .gold-line{width:60pt;height:2pt;background:#c9a84c;margin:6pt auto;}
      p,div{margin:0 0 5pt;line-height:1.85;}
      ul,ol{padding-left:18pt;margin:0 0 8pt;}
      li{margin-bottom:3pt;line-height:1.75;}
      .sig-row{display:flex;justify-content:space-between;margin-top:40pt;}
      .sig-block{text-align:center;width:130pt;}
      .sig-line{border-bottom:1pt solid #333;margin-bottom:4pt;height:20pt;}
      .sig-label{font-size:8pt;color:#666;}
      .footer{font-size:8pt;color:#aaa;border-top:1pt solid #eee;padding-top:4pt;margin-top:16pt;display:flex;justify-content:space-between;}
    </style>
  </head><body>
    <h1>Bangladesh Navy School And College, CTG</h1>
    <div class="meta">
      Subject Teacher: Mahmud Sir | 01883100648<br/>
      <div class="gold-line"></div>
      ${title ? `<strong>${escHtml(title)}</strong><br/>` : ""}
      ${cls ? `Class: ${escHtml(cls)}` : ""}${subject ? ` | Subject: ${escHtml(subject)}` : ""}
    </div>
    ${bodyHTML}
    ${signature ? `
    <div class="sig-row">
      <div class="sig-block"><div class="sig-line"></div><div class="sig-label">Subject Teacher</div></div>
      <div class="sig-block"><div class="sig-line"></div><div class="sig-label">Class Teacher</div></div>
    </div>` : ""}
    <div class="footer"><span>Bangladesh Navy School And College, CTG — Mahmud Sir</span><span>${today}</span></div>
  </body></html>`;

  const blob = new Blob(["\ufeff" + wordHTML], { type: "application/msword" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = `${title}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

// ===== UTILS =====
function escHtml(str) {
  return String(str || "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function escHtmlAttr(str) {
  return String(str || "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}
