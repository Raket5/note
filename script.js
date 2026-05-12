// ===== STATE =====
let sections = [];   // { id, title, pageIndex }
let pages = [];      // { id }
let activeSecId = null;
let activePageId = null;

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  ["docTitle","docClass","docSubject"].forEach(id => {
    document.getElementById(id).addEventListener("input", updateAllPageHeaders);
  });
  ["teacherName","teacherDesig","watermarkText"].forEach(id => {
    document.getElementById(id).addEventListener("input", updateAllPageHeaders);
  });
  document.getElementById("showWatermark").addEventListener("change", updateAllPageHeaders);
  document.getElementById("showPageNum").addEventListener("change", updateAllPageHeaders);
  document.getElementById("showSignature").addEventListener("change", updateSignatures);

  // Start with one blank page
  createPage();
  updateAllPageHeaders();
});

// ===== PAGE CREATION =====
function createPage() {
  const pageId = "pg_" + Date.now() + "_" + Math.random().toString(36).slice(2,6);
  pages.push({ id: pageId });
  activePageId = pageId;

  const canvas = document.getElementById("docCanvas");
  const pageNum = pages.length;

  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.width = "794px";
  wrapper.dataset.pageWrapper = pageId;

  const badge = document.createElement("div");
  badge.className = "page-number-badge";
  badge.textContent = `Page ${pageNum}`;
  wrapper.appendChild(badge);

  const page = document.createElement("div");
  page.className = "a4-page";
  page.id = pageId;
  page.dataset.pageIndex = pageNum - 1;

  // Delete button (only show if more than 1 page)
  const delBtn = document.createElement("button");
  delBtn.className = "page-delete-btn";
  delBtn.title = "Delete this page";
  delBtn.textContent = "✕ Page";
  delBtn.onclick = () => deletePage(pageId);
  page.appendChild(delBtn);

  // Page header
  const header = document.createElement("div");
  header.dataset.pageHeader = pageId;
  page.appendChild(header);

  // Page body
  const body = document.createElement("div");
  body.className = "page-body";
  body.id = "body_" + pageId;
  body.innerHTML = `<div class="no-section-hint" id="hint_${pageId}">
    <div style="font-size:2.2rem">📄</div>
    <p>Left panel থেকে "+ Add" করে একটি section যোগ করুন।</p>
  </div>`;
  page.appendChild(body);

  // Watermarks (injected per page)
  ["wm-tl","wm-tr","wm-bl","wm-br"].forEach(cls => {
    const wm = document.createElement("div");
    wm.className = `wm-corner ${cls}`;
    wm.dataset.wmCorner = pageId;
    page.appendChild(wm);
  });
  const wmC = document.createElement("div");
  wmC.className = "wm-center";
  wmC.dataset.wmCenter = pageId;
  page.appendChild(wmC);

  // Signature placeholder (only last page)
  const sig = document.createElement("div");
  sig.dataset.sigBlock = pageId;
  page.appendChild(sig);

  // Footer
  const footer = document.createElement("div");
  footer.className = "page-footer";
  footer.dataset.footer = pageId;
  page.appendChild(footer);

  wrapper.appendChild(page);
  canvas.appendChild(wrapper);

  renderPageHeader(pageId);
  renderWatermarks(pageId);
  renderFooter(pageId);
  renderSignatures();
  updateDeleteButtons();

  return pageId;
}

function deletePage(pageId) {
  if (pages.length <= 1) { alert("কমপক্ষে একটি page থাকতে হবে।"); return; }
  if (!confirm("এই page টি delete করবেন? এর সব section মুছে যাবে।")) return;

  // Remove sections of this page
  sections = sections.filter(s => {
    if (s.pageId === pageId) {
      const el = document.getElementById("ds_" + s.id);
      if (el) el.remove();
      return false;
    }
    return true;
  });

  pages = pages.filter(p => p.id !== pageId);
  if (activePageId === pageId) activePageId = pages[pages.length - 1].id;

  const wrapper = document.querySelector(`[data-page-wrapper="${pageId}"]`);
  if (wrapper) wrapper.remove();

  // Re-number badges
  document.querySelectorAll(".page-number-badge").forEach((badge, i) => {
    badge.textContent = `Page ${i + 1}`;
  });

  renderSectionList();
  updateDeleteButtons();
  renderSignatures();
  updatePageNumLabels();
}

function addNewPage() {
  const pageId = createPage();
  // Scroll to new page
  const el = document.getElementById(pageId);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateDeleteButtons() {
  document.querySelectorAll(".page-delete-btn").forEach(btn => {
    btn.style.display = pages.length > 1 ? "block" : "none";
  });
}

// ===== PAGE HEADER RENDERING =====
function renderPageHeader(pageId) {
  const el = document.querySelector(`[data-page-header="${pageId}"]`);
  if (!el) return;

  const title   = document.getElementById("docTitle").value.trim();
  const cls     = document.getElementById("docClass").value.trim();
  const subject = document.getElementById("docSubject").value.trim();
  const teacher = document.getElementById("teacherName").value.trim() || "S. M. Mahmud Hasan";
  const desig   = document.getElementById("teacherDesig").value.trim() || "Assistant Teacher";
  const pageIndex = pages.findIndex(p => p.id === pageId);
  const isFirst = pageIndex === 0;

  if (isFirst) {
    let metaParts = [];
    if (cls) metaParts.push(`<b>Class:</b> ${escHtml(cls)}`);
    if (subject) metaParts.push(`<b>Subject:</b> ${escHtml(subject)}`);

    el.className = "page-header";
    el.innerHTML = `
      <div class="page-school-name">Bangladesh Navy School And College, CTG</div>
      <div class="page-school-sub">Subject Teacher: ${escHtml(teacher)} &nbsp;|&nbsp; ${escHtml(desig)}</div>
      <div class="page-gold-line"></div>
      ${title ? `<div class="page-doc-title">${escHtml(title)}</div>` : ""}
      ${metaParts.length ? `<div class="page-meta-row">${metaParts.map(p => `<span>${p}</span>`).join("")}</div>` : ""}
    `;
  } else {
    el.className = "page-header-cont";
    el.innerHTML = `
      <div class="cont-school">Bangladesh Navy School And College, CTG</div>
      ${title ? `<div class="cont-title">${escHtml(title)}${cls ? ` — ${escHtml(cls)}` : ""}</div>` : ""}
    `;
  }
}

function updateAllPageHeaders() {
  pages.forEach(p => renderPageHeader(p.id));
  updateWatermarkText();
  updatePageNumLabels();
}

// ===== WATERMARKS =====
function updateWatermarkText() {
  const wmText = document.getElementById("watermarkText").value.trim() || "Mahmud Sir";
  const show   = document.getElementById("showWatermark").checked;

  document.querySelectorAll("[data-wm-corner]").forEach(el => {
    el.textContent = wmText;
    el.classList.toggle("wm-hidden", !show);
  });
  document.querySelectorAll("[data-wm-center]").forEach(el => {
    el.textContent = wmText;
    el.classList.toggle("wm-hidden", !show);
  });
}

function renderWatermarks(pageId) {
  updateWatermarkText(); // will handle this page too
}

// ===== FOOTER =====
function renderFooter(pageId) {
  const el = document.querySelector(`[data-footer="${pageId}"]`);
  if (!el) return;
  const teacher = document.getElementById("teacherName").value.trim() || "S. M. Mahmud Hasan";
  const showNum = document.getElementById("showPageNum").checked;
  const pageNum = pages.findIndex(p => p.id === pageId) + 1;

  el.innerHTML = `
    <span>Bangladesh Navy School And College, CTG — ${escHtml(teacher)}</span>
    <span style="display:${showNum ? 'inline' : 'none'}">Page ${pageNum}</span>
  `;
}

function updatePageNumLabels() {
  pages.forEach((p, i) => renderFooter(p.id));
  // Update badge texts
  document.querySelectorAll(".page-number-badge").forEach((badge, i) => {
    badge.textContent = `Page ${i + 1}`;
  });
}

// ===== SIGNATURES — only last page, left-aligned =====
function renderSignatures() {
  pages.forEach((p, i) => {
    const el = document.querySelector(`[data-sig-block="${p.id}"]`);
    if (!el) return;
    const isLast = i === pages.length - 1;
    const show   = document.getElementById("showSignature").checked;
    const teacher = document.getElementById("teacherName").value.trim() || "S. M. Mahmud Hasan";
    const desig   = document.getElementById("teacherDesig").value.trim() || "Assistant Teacher";

    if (isLast && show) {
      el.innerHTML = `
        <div class="page-signature">
          <div class="sig-block">
            <div class="sig-line"></div>
            <div class="sig-name">${escHtml(teacher)}</div>
            <div class="sig-desig">${escHtml(desig)}</div>
          </div>
        </div>`;
    } else {
      el.innerHTML = "";
    }
  });
}

function updateSignatures() {
  renderSignatures();
}

// ===== SECTION MANAGEMENT =====
function addSection() {
  // Add to the currently active/last page
  const pageId = activePageId || (pages.length ? pages[pages.length - 1].id : null);
  if (!pageId) { addNewPage(); return; }

  const title = prompt("Section title (optional):", "") ?? "";
  const id = "sec_" + Date.now();
  sections.push({ id, title: title.trim(), pageId });
  renderSectionList();
  renderPageBody(pageId);
  focusSection(id);
}

function deleteSection(id) {
  if (!confirm("Delete this section?")) return;
  const sec = sections.find(s => s.id === id);
  sections = sections.filter(s => s.id !== id);
  if (activeSecId === id) activeSecId = sections.length ? sections[sections.length - 1].id : null;
  renderSectionList();
  const el = document.getElementById("ds_" + id);
  if (el) el.remove();

  // Show hint if page has no more sections
  if (sec) {
    const pageSections = sections.filter(s => s.pageId === sec.pageId);
    if (!pageSections.length) {
      const hint = document.getElementById("hint_" + sec.pageId);
      if (hint) hint.style.display = "flex";
    }
  }
}

function focusSection(id) {
  activeSecId = id;
  const sec = sections.find(s => s.id === id);
  if (sec) activePageId = sec.pageId;
  renderSectionList();
  const editor = document.getElementById("ed_" + id);
  if (editor) {
    editor.focus();
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
  list.innerHTML = sections.map(s => {
    const pageNum = pages.findIndex(p => p.id === s.pageId) + 1;
    return `
    <div class="sec-item ${activeSecId === s.id ? 'active' : ''}" onclick="focusSection('${s.id}')">
      <div>
        <div class="sec-item-name">${escHtml(s.title || "(No title)")}</div>
        <div style="font-size:0.68rem;color:#999;">Pg ${pageNum}</div>
      </div>
      <div class="sec-item-actions">
        <button class="btn-sm" onclick="deleteSection('${s.id}');event.stopPropagation();" title="Delete">🗑</button>
      </div>
    </div>`;
  }).join("");
}

function renderPageBody(pageId) {
  const body = document.getElementById("body_" + pageId);
  const hint = document.getElementById("hint_" + pageId);
  if (!body) return;

  const pageSections = sections.filter(s => s.pageId === pageId);
  pageSections.forEach(sec => {
    if (document.getElementById("ds_" + sec.id)) return;
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
        onfocus="activeSecId='${sec.id}';activePageId='${pageId}';renderSectionList();"
      ></div>`;
    body.appendChild(div);
  });

  if (pageSections.length && hint) hint.style.display = "none";
}

// ===== RICH TEXT COMMANDS =====
function execCmd(cmd, value) {
  document.execCommand(cmd, false, value ?? null);
  const editor = getActiveEditor();
  if (editor) editor.focus();
}

function getActiveEditor() {
  if (activeSecId) return document.getElementById("ed_" + activeSecId);
  return document.querySelector(".doc-section-editor:focus");
}

function insertHeading(tag) {
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
  const teacher = document.getElementById("teacherName").value.trim() || "S. M. Mahmud Hasan";
  const desig   = document.getElementById("teacherDesig").value.trim() || "Assistant Teacher";
  const signature = document.getElementById("showSignature").checked;

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
      .sig-block{margin-top:40pt;display:inline-block;text-align:center;width:130pt;}
      .sig-line{border-bottom:1pt solid #333;margin-bottom:4pt;height:20pt;}
      .sig-name{font-size:8.5pt;color:#333;font-weight:600;}
      .sig-desig{font-size:7.5pt;color:#666;}
      .footer{font-size:8pt;color:#aaa;border-top:1pt solid #eee;padding-top:4pt;margin-top:16pt;display:flex;justify-content:space-between;}
    </style>
  </head><body>
    <h1>Bangladesh Navy School And College, CTG</h1>
    <div class="meta">
      Subject Teacher: ${escHtml(teacher)} | ${escHtml(desig)}<br/>
      <div class="gold-line"></div>
      ${title ? `<strong>${escHtml(title)}</strong><br/>` : ""}
      ${cls ? `Class: ${escHtml(cls)}` : ""}${subject ? ` | Subject: ${escHtml(subject)}` : ""}
    </div>
    ${bodyHTML}
    ${signature ? `
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-name">${escHtml(teacher)}</div>
      <div class="sig-desig">${escHtml(desig)}</div>
    </div>` : ""}
    <div class="footer"><span>Bangladesh Navy School And College, CTG — ${escHtml(teacher)}</span></div>
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
