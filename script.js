// ===== STATE =====
let sections = [];
let editingIndex = null;

// ===== SECTION MANAGEMENT =====

function addSection() {
  editingIndex = null;
  document.getElementById("sectionModalTitle").textContent = "Add Content Section";
  document.getElementById("secTitle").value = "";
  document.getElementById("secContent").value = "";
  document.getElementById("secMarks").value = "";
  document.getElementById("secInstructions").value = "";
  document.querySelector('input[name="secType"][value="text"]').checked = true;
  openModal();
}

function editSection(idx) {
  editingIndex = idx;
  const s = sections[idx];
  document.getElementById("sectionModalTitle").textContent = "Edit Section";
  document.getElementById("secTitle").value = s.title || "";
  document.getElementById("secContent").value = s.content || "";
  document.getElementById("secMarks").value = s.marks || "";
  document.getElementById("secInstructions").value = s.instructions || "";
  document.querySelector(`input[name="secType"][value="${s.type}"]`).checked = true;
  openModal();
}

function deleteSection(idx) {
  sections.splice(idx, 1);
  renderSectionList();
  renderPreview();
}

function moveSection(idx, dir) {
  const to = idx + dir;
  if (to < 0 || to >= sections.length) return;
  [sections[idx], sections[to]] = [sections[to], sections[idx]];
  renderSectionList();
  renderPreview();
}

function saveSection() {
  const title   = document.getElementById("secTitle").value.trim();
  const content = document.getElementById("secContent").value.trim();
  const type    = document.querySelector('input[name="secType"]:checked').value;
  const marks   = document.getElementById("secMarks").value.trim();
  const instructions = document.getElementById("secInstructions").value.trim();

  if (!content) {
    alert("Please enter some content.");
    return;
  }

  const sec = { title, content, type, marks, instructions };

  if (editingIndex !== null) {
    sections[editingIndex] = sec;
  } else {
    sections.push(sec);
  }

  closeModal();
  renderSectionList();
  renderPreview();
}

function renderSectionList() {
  const list = document.getElementById("sectionList");
  if (sections.length === 0) {
    list.innerHTML = '<p class="empty-hint">No sections yet. Click "+ Add" to start.</p>';
    return;
  }
  list.innerHTML = sections.map((s, i) => `
    <div class="section-item">
      <div class="section-item-info" onclick="editSection(${i})">
        <div class="section-item-title">${s.title || "(No title)"}</div>
        <div class="section-item-meta">${typeLabel(s.type)}${s.marks ? " · " + s.marks + " marks" : ""}</div>
      </div>
      <div class="section-item-actions">
        <button class="btn-icon-sm" onclick="moveSection(${i},-1)" title="Move up">↑</button>
        <button class="btn-icon-sm" onclick="moveSection(${i},1)" title="Move down">↓</button>
        <button class="btn-icon-sm" onclick="editSection(${i})" title="Edit">✏️</button>
        <button class="btn-icon-sm" onclick="deleteSection(${i})" title="Delete">🗑️</button>
      </div>
    </div>`).join("");
}

function typeLabel(t) {
  return { text: "Text/Notes", mcq: "MCQ", written: "Written/সাজেশন", blank: "Fill in Blank" }[t] || t;
}

// ===== PREVIEW =====

function renderPreview() {
  const page = document.getElementById("previewPage");
  page.innerHTML = buildSheetHTML();
}

function buildSheetHTML() {
  const title    = document.getElementById("docTitle").value.trim();
  const cls      = document.getElementById("docClass").value.trim();
  const subject  = document.getElementById("docSubject").value.trim();
  const exam     = document.getElementById("docExam").value.trim();
  const marks    = document.getElementById("docMarks").value.trim();
  const time     = document.getElementById("docTime").value.trim();
  const watermark  = document.getElementById("showWatermark").checked;
  const pageNum    = document.getElementById("showPageNum").checked;
  const signature  = document.getElementById("showSignature").checked;

  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  let html = "";

  // Watermark
  if (watermark) {
    html += `<div class="sheet-watermark">MAHMUD</div>`;
  }

  // Header
  html += `
    <div class="sheet-header">
      <div class="sheet-school-name">Bangladesh Navy School And College, CTG</div>
      <div class="sheet-school-sub">Subject Teacher: Mahmud &nbsp;|&nbsp; 📞 01883100648 &nbsp;|&nbsp; WhatsApp: 01883100648</div>
      <div class="sheet-gold-line"></div>
      ${title ? `<div class="sheet-title">${escHtml(title)}</div>` : ""}
      <div class="sheet-meta-row">
        ${cls      ? `<span><b>Class:</b> ${escHtml(cls)}</span>` : ""}
        ${subject  ? `<span><b>Subject:</b> ${escHtml(subject)}</span>` : ""}
        ${exam     ? `<span><b>Exam:</b> ${escHtml(exam)}</span>` : ""}
        ${marks    ? `<span><b>Total Marks:</b> ${escHtml(marks)}</span>` : ""}
        ${time     ? `<span><b>Time:</b> ${escHtml(time)}</span>` : ""}
      </div>
    </div>`;

  // Student info boxes
  html += `
    <div class="sheet-info-boxes">
      <div class="sheet-info-box"><span>Student Name</span><strong>_________________________</strong></div>
      <div class="sheet-info-box"><span>Roll No.</span><strong>___________</strong></div>
    </div>`;

  // Sections
  sections.forEach(sec => {
    html += `<div class="sheet-section">`;

    if (sec.title || sec.marks) {
      html += `
        <div class="sheet-section-header">
          <div class="sheet-section-title">${escHtml(sec.title || "")}</div>
          ${sec.marks ? `<div class="sheet-section-marks">[Marks: ${escHtml(sec.marks)}]</div>` : ""}
        </div>`;
    }

    if (sec.instructions) {
      html += `<div class="sheet-section-instructions">${escHtml(sec.instructions)}</div>`;
    }

    if (sec.type === "mcq") {
      html += renderMCQ(sec.content);
    } else if (sec.type === "written") {
      html += renderWritten(sec.content);
    } else if (sec.type === "blank") {
      html += renderBlank(sec.content);
    } else {
      html += `<div class="sheet-text-content">${escHtml(sec.content)}</div>`;
    }

    html += `</div>`;
  });

  // Signature
  if (signature) {
    html += `
      <div class="sheet-signature">
        <div class="sheet-sig-block">
          <div class="sheet-sig-line"></div>
          <div class="sheet-sig-label">Subject Teacher</div>
        </div>
        <div class="sheet-sig-block">
          <div class="sheet-sig-line"></div>
          <div class="sheet-sig-label">Class Teacher</div>
        </div>
        <div class="sheet-sig-block">
          <div class="sheet-sig-line"></div>
          <div class="sheet-sig-label">Student Signature</div>
        </div>
      </div>`;
  }

  // Footer
  html += `
    <div class="sheet-footer">
      <span>Bangladesh Navy School And College, CTG</span>
      ${pageNum ? `<span>Page 1</span>` : ""}
      <span>${today}</span>
    </div>`;

  return html;
}

// ===== CONTENT RENDERERS =====

function renderMCQ(raw) {
  const lines = raw.split("\n").map(l => l.trim()).filter(l => l);
  let html = "";
  let current = null;
  let opts = [];

  const flushItem = () => {
    if (!current) return;
    const optsHTML = opts.map(o => `<div class="sheet-mcq-opt">${escHtml(o)}</div>`).join("");
    html += `
      <div class="sheet-mcq-item">
        <div class="sheet-mcq-q">${escHtml(current)}</div>
        <div class="sheet-mcq-options">${optsHTML}</div>
      </div>`;
    current = null; opts = [];
  };

  lines.forEach(line => {
    // Option line: starts with a), b), c), d) or ক) খ) গ) ঘ)
    if (/^[a-dA-Dক-ঘ][)\.]/.test(line) || /^\([a-dA-Dক-ঘ]\)/.test(line)) {
      opts.push(line);
    } else if (/^\d+[.)]\s/.test(line)) {
      // New question
      flushItem();
      current = line;
    } else if (current) {
      current += " " + line;
    } else {
      flushItem();
      current = line;
    }
  });
  flushItem();

  return html || `<div class="sheet-text-content">${escHtml(raw)}</div>`;
}

function renderWritten(raw) {
  const lines = raw.split("\n").map(l => l.trim()).filter(l => l);
  return lines.map(line =>
    `<div class="sheet-written-item">${escHtml(line)}</div>`
  ).join("");
}

function renderBlank(raw) {
  // Replace ___ or [...] with a visual blank
  const lines = raw.split("\n").map(l => l.trim()).filter(l => l);
  return lines.map((line, i) => {
    const processed = line
      .replace(/_{3,}/g, '<span class="sheet-blank"></span>')
      .replace(/\[\.+\]/g, '<span class="sheet-blank"></span>');
    return `<div class="sheet-blank-item">${i+1}. ${processed}</div>`;
  }).join("");
}

// ===== PDF DOWNLOAD =====

function downloadPDF() {
  const sheetHTML = buildSheetHTML();
  const css = getSheetCSS();

  const w = window.open("", "_blank");
  w.document.write(`<!DOCTYPE html><html><head>
    <meta charset="UTF-8"/>
    <title>Sheet</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600;700&family=Noto+Serif+Bengali:wght@400;600;700&display=swap" rel="stylesheet"/>
    <style>${css}</style>
    <script>
      window.onload = function() {
        window.print();
        window.onafterprint = function() { window.close(); };
      };
    <\/script>
  </head><body>
    <div class="preview-page print-mode">${sheetHTML}</div>
  </body></html>`);
  w.document.close();
}

// ===== WORD (DOCX) DOWNLOAD =====

function downloadDOCX() {
  const title   = document.getElementById("docTitle").value.trim() || "Sheet";
  const cls     = document.getElementById("docClass").value.trim();
  const subject = document.getElementById("docSubject").value.trim();
  const exam    = document.getElementById("docExam").value.trim();
  const marks   = document.getElementById("docMarks").value.trim();
  const time    = document.getElementById("docTime").value.trim();
  const signature = document.getElementById("showSignature").checked;
  const today   = new Date().toLocaleDateString("en-GB");

  // Build a clean HTML that Word can import well
  const wordHTML = `<!DOCTYPE html><html><head>
    <meta charset="UTF-8"/>
    <style>
      body { font-family: 'Noto Serif Bengali', 'Times New Roman', serif; margin: 2cm 2.5cm; font-size: 11pt; color: #000; }
      h1 { font-size: 14pt; text-align: center; color: #0f1f45; margin-bottom: 2pt; }
      h2 { font-size: 11pt; text-align: center; color: #333; margin-bottom: 4pt; }
      .meta { text-align: center; font-size: 9pt; color: #555; margin-bottom: 16pt; border-bottom: 2px solid #0f1f45; padding-bottom: 8pt; }
      .info-row { display: flex; justify-content: space-between; border: 1px solid #ccc; padding: 4pt 8pt; margin-bottom: 12pt; font-size: 10pt; }
      .section-title { font-size: 11pt; font-weight: bold; color: #0f1f45; border-bottom: 1px solid #0f1f45; margin-top: 14pt; margin-bottom: 6pt; padding-bottom: 2pt; }
      .instructions { font-size: 9pt; color: #666; font-style: italic; margin-bottom: 6pt; }
      .mcq-q { margin-bottom: 8pt; font-size: 10.5pt; }
      .mcq-opts { display: grid; grid-template-columns: 1fr 1fr; padding-left: 14pt; gap: 2pt; font-size: 10pt; }
      .written-item { margin-bottom: 8pt; font-size: 10.5pt; }
      .blank-item { margin-bottom: 6pt; font-size: 10.5pt; }
      .sig-row { display: flex; justify-content: space-between; margin-top: 40pt; }
      .sig-block { text-align: center; width: 130pt; }
      .sig-line { border-bottom: 1px solid #333; margin-bottom: 4pt; height: 20pt; }
      .sig-label { font-size: 8pt; color: #666; }
      .footer { font-size: 8pt; color: #aaa; border-top: 1px solid #eee; padding-top: 4pt; margin-top: 16pt; display: flex; justify-content: space-between; }
    </style>
  </head><body>
    <h1>Bangladesh Navy School And College, CTG</h1>
    <h2>Subject Teacher: Mahmud | 01883100648</h2>
    <div class="meta">
      ${title ? `<strong>${escHtml(title)}</strong><br/>` : ""}
      ${cls ? `Class: ${escHtml(cls)} &nbsp;` : ""}
      ${subject ? `| Subject: ${escHtml(subject)} &nbsp;` : ""}
      ${exam ? `| ${escHtml(exam)} &nbsp;` : ""}
      ${marks ? `| Total: ${escHtml(marks)} &nbsp;` : ""}
      ${time ? `| Time: ${escHtml(time)}` : ""}
    </div>
    <div class="info-row">
      <span>Student Name: _______________________</span>
      <span>Roll No: __________</span>
    </div>
    ${sections.map(sec => `
      <div>
        ${sec.title ? `<div class="section-title">${escHtml(sec.title)}${sec.marks ? ` [Marks: ${escHtml(sec.marks)}]` : ""}</div>` : ""}
        ${sec.instructions ? `<div class="instructions">${escHtml(sec.instructions)}</div>` : ""}
        ${buildWordSection(sec)}
      </div>`).join("")}
    ${signature ? `
    <div class="sig-row">
      <div class="sig-block"><div class="sig-line"></div><div class="sig-label">Subject Teacher</div></div>
      <div class="sig-block"><div class="sig-line"></div><div class="sig-label">Class Teacher</div></div>
      <div class="sig-block"><div class="sig-line"></div><div class="sig-label">Student Signature</div></div>
    </div>` : ""}
    <div class="footer"><span>Bangladesh Navy School And College, CTG</span><span>${today}</span></div>
  </body></html>`;

  const blob = new Blob(["\ufeff" + wordHTML], { type: "application/msword" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${title || "sheet"}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

function buildWordSection(sec) {
  if (sec.type === "mcq") {
    const lines = sec.content.split("\n").map(l => l.trim()).filter(l => l);
    let html = ""; let current = null; let opts = [];
    const flush = () => {
      if (!current) return;
      html += `<div class="mcq-q">${escHtml(current)}<div class="mcq-opts">${opts.map(o=>`<span>${escHtml(o)}</span>`).join("")}</div></div>`;
      current = null; opts = [];
    };
    lines.forEach(line => {
      if (/^[a-dA-Dক-ঘ][)\.]/.test(line) || /^\([a-dA-Dক-ঘ]\)/.test(line)) { opts.push(line); }
      else if (/^\d+[.)]\s/.test(line)) { flush(); current = line; }
      else if (current) { current += " " + line; }
      else { flush(); current = line; }
    });
    flush();
    return html;
  } else if (sec.type === "written") {
    return sec.content.split("\n").filter(l=>l.trim()).map(l=>`<div class="written-item">${escHtml(l)}</div>`).join("");
  } else if (sec.type === "blank") {
    return sec.content.split("\n").filter(l=>l.trim()).map((l,i)=>`<div class="blank-item">${i+1}. ${escHtml(l).replace(/_{3,}/g,'<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>')}</div>`).join("");
  } else {
    return `<div style="white-space:pre-wrap;font-size:10.5pt;line-height:1.8;">${escHtml(sec.content)}</div>`;
  }
}

// ===== PRINT CSS =====

function getSheetCSS() {
  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #fff; font-family: 'Source Sans 3', 'Noto Serif Bengali', serif; }
    .preview-page { width: 100%; padding: 20mm 22mm 28mm; background: #fff; position: relative; overflow: hidden; font-size: 11pt; color: #111; min-height: 100vh; }
    .sheet-watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-35deg); font-size: 72pt; font-weight: 900; color: rgba(15,31,69,0.04); white-space: nowrap; pointer-events: none; font-family: 'Playfair Display', serif; letter-spacing: 4px; z-index: 0; }
    .sheet-header { text-align: center; border-bottom: 3px solid #0f1f45; padding-bottom: 12pt; margin-bottom: 14pt; }
    .sheet-school-name { font-size: 14pt; font-weight: 700; color: #0f1f45; font-family: 'Playfair Display', serif; }
    .sheet-school-sub { font-size: 9pt; color: #555; margin-top: 2pt; }
    .sheet-gold-line { width: 60pt; height: 2pt; background: #c9a84c; margin: 6pt auto; border-radius: 2pt; }
    .sheet-title { font-size: 13pt; font-weight: 700; color: #0f1f45; font-family: 'Noto Serif Bengali', 'Playfair Display', serif; }
    .sheet-meta-row { display: flex; justify-content: center; gap: 20pt; margin-top: 6pt; font-size: 9pt; color: #444; flex-wrap: wrap; }
    .sheet-meta-row span b { color: #0f1f45; }
    .sheet-info-boxes { display: grid; grid-template-columns: 1fr 1fr; gap: 8pt; margin-bottom: 16pt; }
    .sheet-info-box { border: 1pt solid #ccc; border-radius: 4pt; padding: 6pt 10pt; font-size: 9.5pt; }
    .sheet-info-box span { color: #888; font-size: 8.5pt; display: block; }
    .sheet-section { margin-bottom: 20pt; }
    .sheet-section-header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1.5pt solid #0f1f45; padding-bottom: 3pt; margin-bottom: 8pt; }
    .sheet-section-title { font-size: 11pt; font-weight: 700; color: #0f1f45; font-family: 'Noto Serif Bengali', serif; }
    .sheet-section-marks { font-size: 9pt; color: #666; }
    .sheet-section-instructions { font-size: 9pt; color: #888; font-style: italic; margin-bottom: 6pt; }
    .sheet-mcq-item { margin-bottom: 12pt; }
    .sheet-mcq-q { font-size: 10.5pt; color: #111; font-family: 'Noto Serif Bengali', serif; margin-bottom: 3pt; }
    .sheet-mcq-options { display: grid; grid-template-columns: 1fr 1fr; gap: 1pt 14pt; padding-left: 14pt; }
    .sheet-mcq-opt { font-size: 9.5pt; color: #333; font-family: 'Noto Serif Bengali', serif; }
    .sheet-text-content { font-size: 10.5pt; line-height: 1.8; white-space: pre-wrap; font-family: 'Noto Serif Bengali', serif; }
    .sheet-written-item { margin-bottom: 10pt; font-size: 10.5pt; line-height: 1.7; font-family: 'Noto Serif Bengali', serif; }
    .sheet-blank-item { margin-bottom: 8pt; font-size: 10.5pt; font-family: 'Noto Serif Bengali', serif; }
    .sheet-blank { display: inline-block; min-width: 70pt; border-bottom: 1pt solid #333; }
    .sheet-signature { margin-top: 36pt; display: flex; justify-content: space-between; }
    .sheet-sig-block { text-align: center; }
    .sheet-sig-line { width: 110pt; border-bottom: 1.5pt solid #333; margin: 0 auto 4pt; }
    .sheet-sig-label { font-size: 8pt; color: #666; }
    .sheet-footer { position: fixed; bottom: 12mm; left: 22mm; right: 22mm; display: flex; justify-content: space-between; font-size: 8pt; color: #aaa; border-top: 1pt solid #eee; padding-top: 4pt; }
    @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } @page { size: A4; margin: 0; } }
  `;
}

// ===== MODAL =====

function openModal() {
  document.getElementById("sectionModal").classList.remove("hidden");
}
function closeModal() {
  document.getElementById("sectionModal").classList.add("hidden");
}

// ===== UTILS =====

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ===== AUTO-REFRESH =====

["docTitle","docClass","docSubject","docExam","docMarks","docTime"].forEach(id => {
  document.getElementById(id).addEventListener("input", renderPreview);
});
["showWatermark","showPageNum","showSignature"].forEach(id => {
  document.getElementById(id).addEventListener("change", renderPreview);
});

// Enter key closes modal
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
  if (e.key === "Enter" && !document.getElementById("sectionModal").classList.contains("hidden")) {
    if (document.activeElement.tagName !== "TEXTAREA") saveSection();
  }
});

// Initial render
renderPreview();
