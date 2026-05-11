// ===== STATE =====
let sections = [];
let activeSecIdx = null;
let editingModal = false;

// Paragraph types
const PARA_TYPES = [
  { value: "normal",    label: "Normal Text" },
  { value: "heading",   label: "Heading" },
  { value: "subhead",   label: "Sub-Heading" },
  { value: "bullet",    label: "Bullet Point" },
  { value: "numbered",  label: "Numbered" },
  { value: "note",      label: "Side Note" },
  { value: "important", label: "⚠️ Important" },
  { value: "mcq-q",     label: "MCQ Question" },
  { value: "mcq-opt",   label: "MCQ Option" },
];

const TYPE_LABELS = {
  text: "📄 Text", mcq: "✅ MCQ", written: "✍️ Written", blank: "📋 Blank"
};

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  ["docTitle","docClass","docSubject"].forEach(id => {
    document.getElementById(id).addEventListener("input", () => {
      if (document.getElementById("tabPreview").classList.contains("active")) renderPreview();
    });
  });
  ["showWatermark","showPageNum","showSignature"].forEach(id => {
    document.getElementById(id).addEventListener("change", () => {
      if (document.getElementById("tabPreview").classList.contains("active")) renderPreview();
    });
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });
});

// ===== TABS =====
function switchTab(tab) {
  document.getElementById("tabEditorBtn").classList.toggle("active", tab === "editor");
  document.getElementById("tabPreviewBtn").classList.toggle("active", tab === "preview");
  document.getElementById("tabEditor").classList.toggle("active", tab === "editor");
  document.getElementById("tabEditor").classList.toggle("hidden", tab !== "editor");
  document.getElementById("tabPreview").classList.toggle("active", tab === "preview");
  document.getElementById("tabPreview").classList.toggle("hidden", tab !== "preview");

  if (tab === "preview") renderPreview();
}

// ===== SECTION MANAGEMENT =====
function addSection() {
  editingModal = false;
  document.getElementById("sectionModalTitle").textContent = "New Section";
  document.getElementById("secTitle").value = "";
  document.querySelector('input[name="secType"][value="text"]').checked = true;
  openModal();
}

function confirmAddSection() {
  const title = document.getElementById("secTitle").value.trim();
  const type  = document.querySelector('input[name="secType"]:checked').value;

  const sec = {
    title,
    type,
    paragraphs: [{ type: defaultParaType(type), content: "", spacing: "0" }]
  };

  sections.push(sec);
  closeModal();
  renderSectionList();
  openSectionEditor(sections.length - 1);
}

function defaultParaType(secType) {
  if (secType === "mcq")     return "mcq-q";
  if (secType === "written") return "numbered";
  if (secType === "blank")   return "normal";
  return "normal";
}

function deleteSection(idx, e) {
  e.stopPropagation();
  if (!confirm("Delete this section?")) return;
  sections.splice(idx, 1);
  if (activeSecIdx >= sections.length) activeSecIdx = sections.length - 1;
  renderSectionList();
  if (sections.length === 0) {
    activeSecIdx = null;
    document.getElementById("editorEmpty").style.display = "flex";
    document.getElementById("editorArea").classList.add("hidden");
  } else {
    openSectionEditor(activeSecIdx ?? 0);
  }
}

function moveSection(idx, dir, e) {
  e.stopPropagation();
  const to = idx + dir;
  if (to < 0 || to >= sections.length) return;
  [sections[idx], sections[to]] = [sections[to], sections[idx]];
  if (activeSecIdx === idx) activeSecIdx = to;
  else if (activeSecIdx === to) activeSecIdx = idx;
  renderSectionList();
  if (activeSecIdx !== null) renderSectionEditor(activeSecIdx);
}

function renderSectionList() {
  const list = document.getElementById("sectionList");
  if (sections.length === 0) {
    list.innerHTML = '<p class="empty-hint">কোনো section নেই। "+ Add" চাপুন।</p>';
    return;
  }
  list.innerHTML = sections.map((s, i) => `
    <div class="section-item ${activeSecIdx === i ? 'active' : ''}" onclick="openSectionEditor(${i})">
      <div class="section-item-info">
        <div class="section-item-title">${s.title || "(No title)"}</div>
        <div class="section-item-meta">${TYPE_LABELS[s.type] || s.type} · ${s.paragraphs.length} block${s.paragraphs.length !== 1 ? 's' : ''}</div>
      </div>
      <div class="section-item-actions">
        <button class="btn-icon-sm" onclick="moveSection(${i},-1,event)" title="Up">↑</button>
        <button class="btn-icon-sm" onclick="moveSection(${i},1,event)" title="Down">↓</button>
        <button class="btn-icon-sm" onclick="deleteSection(${i},event)" title="Delete">🗑️</button>
      </div>
    </div>`).join("");
}

// ===== SECTION EDITOR =====
function openSectionEditor(idx) {
  activeSecIdx = idx;
  renderSectionList();
  document.getElementById("editorEmpty").style.display = "none";
  document.getElementById("editorArea").classList.remove("hidden");
  renderSectionEditor(idx);
}

function renderSectionEditor(idx) {
  const sec = sections[idx];
  const area = document.getElementById("editorArea");

  const typeOptHTML = PARA_TYPES.map(t =>
    `<option value="${t.value}">${t.label}</option>`
  ).join("");

  const parasHTML = sec.paragraphs.map((p, pi) => `
    <div class="para-item" id="para-${idx}-${pi}" onfocus="markFocused(this)" tabindex="-1">
      <div class="para-item-header">
        <span class="para-drag-handle">⠿</span>
        <select class="para-type-select" onchange="changeParaType(${idx},${pi},this.value)">
          ${PARA_TYPES.map(t => `<option value="${t.value}" ${p.type === t.value ? 'selected' : ''}>${t.label}</option>`).join("")}
        </select>
        <span class="para-spacing-label">Space after (px):</span>
        <input class="para-spacing-input" type="number" value="${p.spacing || 0}" min="0" max="60"
          onchange="changeParaSpacing(${idx},${pi},this.value)" />
        <button class="para-delete-btn" onclick="deletePara(${idx},${pi})" title="Delete block">✕</button>
      </div>
      <textarea class="para-content" rows="${calcRows(p.content)}"
        placeholder="${paraPlaceholder(p.type)}"
        oninput="updateParaContent(${idx},${pi},this); autoResize(this)"
        onpaste="handlePaste(event,${idx},${pi})"
      >${escHtmlAttr(p.content)}</textarea>
    </div>`).join("");

  area.innerHTML = `
    <div class="editor-toolbar">
      <span class="toolbar-label">Add block:</span>
      <button class="toolbar-btn" onclick="addPara(${idx},'normal')">📄 Normal</button>
      <button class="toolbar-btn" onclick="addPara(${idx},'heading')">H Heading</button>
      <button class="toolbar-btn" onclick="addPara(${idx},'subhead')">h Sub-Heading</button>
      <button class="toolbar-btn" onclick="addPara(${idx},'bullet')">• Bullet</button>
      <button class="toolbar-btn" onclick="addPara(${idx},'numbered')">1. Numbered</button>
      <button class="toolbar-btn" onclick="addPara(${idx},'important')">⚠️ Important</button>
      <button class="toolbar-btn" onclick="addPara(${idx},'note')">📌 Note</button>
      <div class="toolbar-sep"></div>
      <button class="toolbar-btn" onclick="addPara(${idx},'mcq-q')">MCQ Q</button>
      <button class="toolbar-btn" onclick="addPara(${idx},'mcq-opt')">MCQ Opt</button>
    </div>
    <div class="editor-main">
      <div class="editor-block">
        <div class="editor-block-title">
          <input type="text" placeholder="Section title (optional)"
            value="${escHtmlAttr(sec.title)}"
            oninput="updateSecTitle(${idx},this.value)" />
          <span class="type-badge">${TYPE_LABELS[sec.type] || sec.type}</span>
        </div>
        <div class="para-list" id="paraList-${idx}">
          ${parasHTML}
        </div>
        <button class="add-para-btn" onclick="addPara(${idx},'normal')">＋ Add Text Block</button>
      </div>
    </div>`;
}

function markFocused(el) {
  document.querySelectorAll(".para-item.focused").forEach(e => e.classList.remove("focused"));
  el.classList.add("focused");
}

function calcRows(content) {
  if (!content) return 2;
  const lines = content.split("\n").length;
  return Math.max(2, Math.min(lines + 1, 20));
}

function paraPlaceholder(type) {
  const map = {
    normal: "এখানে লিখুন...",
    heading: "Heading লিখুন...",
    subhead: "Sub-heading লিখুন...",
    bullet: "Bullet point লিখুন...",
    numbered: "1. প্রথম point\n2. দ্বিতীয় point",
    note: "Side note লিখুন...",
    important: "Important point লিখুন...",
    "mcq-q": "1. প্রশ্ন লিখুন",
    "mcq-opt": "a) option\nb) option\nc) option\nd) option",
  };
  return map[type] || "লিখুন...";
}

// ===== PARA OPERATIONS =====
function addPara(secIdx, type) {
  sections[secIdx].paragraphs.push({ type, content: "", spacing: "0" });
  renderSectionEditor(secIdx);
  // Focus last textarea
  setTimeout(() => {
    const list = document.getElementById(`paraList-${secIdx}`);
    if (list) {
      const textareas = list.querySelectorAll("textarea");
      if (textareas.length) textareas[textareas.length - 1].focus();
    }
  }, 50);
}

function deletePara(secIdx, paraIdx) {
  if (sections[secIdx].paragraphs.length <= 1) {
    alert("কমপক্ষে একটা block থাকতে হবে।");
    return;
  }
  sections[secIdx].paragraphs.splice(paraIdx, 1);
  renderSectionEditor(secIdx);
}

function updateParaContent(secIdx, paraIdx, el) {
  sections[secIdx].paragraphs[paraIdx].content = el.value;
}

function changeParaType(secIdx, paraIdx, type) {
  sections[secIdx].paragraphs[paraIdx].type = type;
  // Re-render just this item's placeholder & style — no full re-render
  const ta = document.querySelector(`#para-${secIdx}-${paraIdx} textarea`);
  if (ta) ta.placeholder = paraPlaceholder(type);
}

function changeParaSpacing(secIdx, paraIdx, val) {
  sections[secIdx].paragraphs[paraIdx].spacing = val;
}

function updateSecTitle(secIdx, val) {
  sections[secIdx].title = val;
  renderSectionList();
}

function autoResize(el) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

// Smart paste: split by newlines into multiple blocks
function handlePaste(e, secIdx, paraIdx) {
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData("text");
  const lines = text.split("\n").map(l => l.trimEnd()).filter(l => l !== "");

  if (lines.length <= 1) {
    // Single line — normal paste
    const ta = e.target;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const current = ta.value;
    const newVal = current.slice(0, start) + text + current.slice(end);
    ta.value = newVal;
    sections[secIdx].paragraphs[paraIdx].content = newVal;
    autoResize(ta);
    return;
  }

  // Multi-line: insert first line into current block, rest as new blocks
  const currentContent = sections[secIdx].paragraphs[paraIdx].content;
  const currentType    = sections[secIdx].paragraphs[paraIdx].type;
  sections[secIdx].paragraphs[paraIdx].content = currentContent
    ? currentContent + "\n" + lines[0]
    : lines[0];

  const newParas = lines.slice(1).map(line => ({
    type: currentType,
    content: line,
    spacing: "0"
  }));

  sections[secIdx].paragraphs.splice(paraIdx + 1, 0, ...newParas);
  renderSectionEditor(secIdx);
}

// ===== PREVIEW RENDER =====
function renderPreview() {
  document.getElementById("previewPage").innerHTML = buildSheetHTML();
  // Auto-resize all textareas after re-render
  document.querySelectorAll(".para-content").forEach(autoResize);
}

function buildSheetHTML() {
  const title   = document.getElementById("docTitle").value.trim();
  const cls     = document.getElementById("docClass").value.trim();
  const subject = document.getElementById("docSubject").value.trim();
  const watermark  = document.getElementById("showWatermark").checked;
  const pageNum    = document.getElementById("showPageNum").checked;
  const signature  = document.getElementById("showSignature").checked;
  const today = new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });

  let html = "";

  // Corner watermarks
  if (watermark) {
    html += `
      <div class="wm-corner wm-tl">MAHMUD Sir</div>
      <div class="wm-corner wm-tr">MAHMUD Sir</div>
      <div class="wm-corner wm-bl">MAHMUD Sir</div>
      <div class="wm-corner wm-br">MAHMUD Sir</div>
      <div class="wm-center">MAHMUD</div>`;
  }

  // Header
  html += `
    <div class="sheet-header">
      <div class="sheet-school-name">Bangladesh Navy School And College, CTG</div>
      <div class="sheet-school-sub">Subject Teacher: Mahmud Sir &nbsp;|&nbsp; 📞 01883100648</div>
      <div class="sheet-gold-line"></div>
      ${title ? `<div class="sheet-title">${escHtml(title)}</div>` : ""}
      <div class="sheet-meta-row">
        ${cls     ? `<span><b>Class:</b> ${escHtml(cls)}</span>` : ""}
        ${subject ? `<span><b>Subject:</b> ${escHtml(subject)}</span>` : ""}
      </div>
    </div>`;

  // Sections
  sections.forEach(sec => {
    html += `<div class="sheet-section">`;
    if (sec.title) {
      html += `
        <div class="sheet-section-header">
          <div class="sheet-section-title">${escHtml(sec.title)}</div>
        </div>`;
    }
    sec.paragraphs.forEach(p => {
      if (!p.content.trim()) return;
      const marginBottom = p.spacing && p.spacing !== "0" ? `margin-bottom:${p.spacing}px;` : "";
      html += `<div class="preview-para preview-para-${p.type}" style="${marginBottom}">`;

      if (p.type === "numbered") {
        // Auto-number lines
        const lines = p.content.split("\n").filter(l => l.trim());
        lines.forEach((line, i) => {
          // If line already starts with number, keep it
          const numbered = /^\d+[.)]\s/.test(line.trim()) ? line : `${i+1}. ${line}`;
          html += `<div>${escHtml(numbered)}</div>`;
        });
      } else if (p.type === "bullet") {
        const lines = p.content.split("\n").filter(l => l.trim());
        lines.forEach(line => {
          html += `<div class="preview-para-bullet">${escHtml(line.replace(/^[-•]\s*/, ""))}</div>`;
        });
      } else if (p.type === "mcq-opt") {
        const lines = p.content.split("\n").filter(l => l.trim());
        html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 14px;padding-left:14px;">`;
        lines.forEach(line => {
          html += `<div class="preview-para-mcq-opt">${escHtml(line)}</div>`;
        });
        html += `</div>`;
      } else {
        html += escHtml(p.content).replace(/\n/g, "<br/>");
      }

      html += `</div>`;
    });
    html += `</div>`;
  });

  // Signature
  if (signature) {
    html += `
      <div class="sheet-signature">
        <div class="sheet-sig-block"><div class="sheet-sig-line"></div><div class="sheet-sig-label">Subject Teacher</div></div>
        <div class="sheet-sig-block"><div class="sheet-sig-line"></div><div class="sheet-sig-label">Class Teacher</div></div>
      </div>`;
  }

  // Footer
  html += `
    <div class="sheet-footer">
      <span>Bangladesh Navy School And College, CTG — Mahmud Sir</span>
      ${pageNum ? `<span>Page 1</span>` : ""}
      <span>${today}</span>
    </div>`;

  return html;
}

// ===== PDF DOWNLOAD =====
function downloadPDF() {
  const sheetHTML = buildSheetHTML();
  const w = window.open("", "_blank");
  w.document.write(`<!DOCTYPE html><html><head>
    <meta charset="UTF-8"/>
    <title>${escHtml(document.getElementById("docTitle").value || "Sheet")}</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600;700&family=Noto+Serif+Bengali:wght@400;600;700&display=swap" rel="stylesheet"/>
    <style>${getPrintCSS()}</style>
    <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>
  </head><body><div class="sheet-page">${sheetHTML}</div></body></html>`);
  w.document.close();
}

// ===== WORD DOWNLOAD =====
function downloadDOCX() {
  const title   = document.getElementById("docTitle").value.trim() || "Sheet";
  const cls     = document.getElementById("docClass").value.trim();
  const subject = document.getElementById("docSubject").value.trim();
  const signature = document.getElementById("showSignature").checked;
  const today = new Date().toLocaleDateString("en-GB");

  let bodyHTML = "";
  sections.forEach(sec => {
    if (sec.title) bodyHTML += `<h2>${escHtml(sec.title)}</h2>`;
    sec.paragraphs.forEach(p => {
      if (!p.content.trim()) return;
      const style = `margin-bottom:${p.spacing || 0}px;`;
      switch(p.type) {
        case "heading":   bodyHTML += `<h3 style="${style}">${escHtml(p.content)}</h3>`; break;
        case "subhead":   bodyHTML += `<h4 style="${style}">${escHtml(p.content)}</h4>`; break;
        case "important": bodyHTML += `<p style="color:#8b0000;font-weight:600;border-left:3px solid #e74c3c;padding-left:8pt;${style}">${escHtml(p.content)}</p>`; break;
        case "note":      bodyHTML += `<p style="color:#555;font-style:italic;border-left:2px solid #c9a84c;padding-left:8pt;${style}">${escHtml(p.content)}</p>`; break;
        case "bullet": {
          const lines = p.content.split("\n").filter(l=>l.trim());
          bodyHTML += `<ul style="${style}">` + lines.map(l=>`<li>${escHtml(l.replace(/^[-•]\s*/,""))}</li>`).join("") + `</ul>`;
          break;
        }
        case "numbered": {
          const lines = p.content.split("\n").filter(l=>l.trim());
          bodyHTML += `<ol style="${style}">` + lines.map(l=>`<li>${escHtml(l.replace(/^\d+[.)]\s*/,""))}</li>`).join("") + `</ol>`;
          break;
        }
        case "mcq-q":   bodyHTML += `<p style="font-weight:600;${style}">${escHtml(p.content)}</p>`; break;
        case "mcq-opt": {
          const lines = p.content.split("\n").filter(l=>l.trim());
          bodyHTML += `<table style="width:100%;padding-left:14pt;${style}"><tr>` +
            lines.map(l=>`<td style="width:50%;font-size:10pt;">${escHtml(l)}</td>`).join("") +
            `</tr></table>`;
          break;
        }
        default: bodyHTML += `<p style="line-height:1.8;${style}">${escHtml(p.content).replace(/\n/g,"<br/>")}</p>`;
      }
    });
  });

  const wordHTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
    <style>
      body{font-family:'Noto Serif Bengali','Times New Roman',serif;margin:2cm 2.5cm;font-size:11pt;color:#000;}
      h1{font-size:14pt;text-align:center;color:#0f1f45;margin-bottom:2pt;}
      h2{font-size:11pt;font-weight:700;color:#0f1f45;border-bottom:1pt solid #0f1f45;margin:14pt 0 6pt;padding-bottom:2pt;}
      h3{font-size:12pt;color:#0f1f45;margin:8pt 0 3pt;}
      h4{font-size:11pt;color:#1a3a6b;margin:6pt 0 3pt;}
      .meta{text-align:center;font-size:9pt;color:#555;margin-bottom:14pt;border-bottom:2pt solid #0f1f45;padding-bottom:8pt;}
      .gold-line{width:60pt;height:2pt;background:#c9a84c;margin:6pt auto;}
      p{margin:0 0 6pt;line-height:1.8;}
      ul,ol{padding-left:18pt;margin:0 0 8pt;}
      li{margin-bottom:3pt;line-height:1.7;}
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

// ===== PRINT CSS =====
function getPrintCSS() {
  return `
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:#fff;font-family:'Source Sans 3','Noto Serif Bengali',serif;}
    .sheet-page{width:100%;padding:16mm 20mm 24mm;background:#fff;position:relative;font-size:11pt;color:#111;}
    .wm-corner{position:fixed;font-size:9pt;font-weight:700;color:rgba(15,31,69,0.07);font-family:'Playfair Display',serif;letter-spacing:2px;}
    .wm-tl{top:10mm;left:10mm;transform:rotate(-20deg);}
    .wm-tr{top:10mm;right:10mm;transform:rotate(20deg);}
    .wm-bl{bottom:20mm;left:10mm;transform:rotate(20deg);}
    .wm-br{bottom:20mm;right:10mm;transform:rotate(-20deg);}
    .wm-center{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:52pt;font-weight:900;color:rgba(15,31,69,0.03);font-family:'Playfair Display',serif;white-space:nowrap;}
    .sheet-header{text-align:center;border-bottom:3px solid #0f1f45;padding-bottom:12pt;margin-bottom:16pt;}
    .sheet-school-name{font-size:13.5pt;font-weight:700;color:#0f1f45;font-family:'Playfair Display',serif;}
    .sheet-school-sub{font-size:8.5pt;color:#555;margin-top:2pt;}
    .sheet-gold-line{width:60pt;height:2pt;background:#c9a84c;margin:7pt auto;border-radius:2pt;}
    .sheet-title{font-size:13pt;font-weight:700;color:#0f1f45;font-family:'Noto Serif Bengali','Playfair Display',serif;}
    .sheet-meta-row{display:flex;justify-content:center;gap:22pt;margin-top:6pt;font-size:9pt;color:#444;flex-wrap:wrap;}
    .sheet-section{margin-bottom:18pt;}
    .sheet-section-header{border-bottom:1.5pt solid #0f1f45;padding-bottom:3pt;margin-bottom:8pt;}
    .sheet-section-title{font-size:11pt;font-weight:700;color:#0f1f45;font-family:'Noto Serif Bengali',serif;}
    .preview-para{margin-bottom:4pt;}
    .preview-para-normal{font-size:10.5pt;line-height:1.8;color:#111;font-family:'Noto Serif Bengali',serif;}
    .preview-para-heading{font-size:12pt;font-weight:700;color:#0f1f45;font-family:'Noto Serif Bengali',serif;margin-top:6pt;}
    .preview-para-subhead{font-size:11pt;font-weight:600;color:#1a3a6b;font-family:'Noto Serif Bengali',serif;}
    .preview-para-note{font-size:9.5pt;color:#555;font-style:italic;padding-left:12pt;border-left:2pt solid #c9a84c;}
    .preview-para-important{font-size:10.5pt;font-weight:600;color:#8b0000;padding:3pt 8pt;border-left:3pt solid #e74c3c;}
    .preview-para-mcq-q{font-size:10.5pt;font-weight:600;color:#111;font-family:'Noto Serif Bengali',serif;margin-top:4pt;}
    .preview-para-mcq-opt{font-size:9.5pt;color:#333;font-family:'Noto Serif Bengali',serif;}
    .preview-para-bullet{font-size:10.5pt;color:#111;font-family:'Noto Serif Bengali',serif;padding-left:14pt;position:relative;}
    .preview-para-bullet::before{content:"•";position:absolute;left:4pt;color:#c9a84c;}
    .preview-para-numbered{font-size:10.5pt;font-family:'Noto Serif Bengali',serif;color:#111;}
    .sheet-signature{margin-top:36pt;display:flex;justify-content:space-between;}
    .sheet-sig-block{text-align:center;}
    .sheet-sig-line{width:120pt;border-bottom:1.5pt solid #333;margin:0 auto 4pt;}
    .sheet-sig-label{font-size:8pt;color:#666;}
    .sheet-footer{position:fixed;bottom:8mm;left:20mm;right:20mm;display:flex;justify-content:space-between;font-size:8pt;color:#aaa;border-top:1pt solid #eee;padding-top:4pt;}
    @media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}@page{size:A4;margin:0;}}
  `;
}

// ===== MODAL =====
function openModal() { document.getElementById("sectionModal").classList.remove("hidden"); }
function closeModal() { document.getElementById("sectionModal").classList.add("hidden"); }

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
