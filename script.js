// =============================================
// SHEET MAKER — Advanced A4 Print Layout
// MS Word Style Page by Page Editor
// =============================================

const pagesContainer = document.getElementById('pagesContainer');
const sheetTitle = document.getElementById('sheetTitle');
const sheetSubject = document.getElementById('sheetSubject');
const sheetClass = document.getElementById('sheetClass');
const sheetType = document.getElementById('sheetType');
const teacherName = document.getElementById('teacherName');
const teacherMobile = document.getElementById('teacherMobile');
const teacherWhatsapp = document.getElementById('teacherWhatsapp');
const fontChoice = document.getElementById('fontChoice');
const watermarkText = document.getElementById('watermarkText');
const showWatermark = document.getElementById('showWatermark');
const showPageNum = document.getElementById('showPageNum');
const showTeacherSignature = document.getElementById('showTeacherSignature');

// Default 3 pages visible in editor
let pageCount = 3;

function getFontFamily() {
    return fontChoice.value === 'hind' 
        ? "'Hind Siliguri', 'Inter', sans-serif" 
        : "'Inter', sans-serif";
}

function updateAllPagesFont() {
    document.querySelectorAll('.page-editor').forEach(editor => {
        editor.style.fontFamily = getFontFamily();
    });
}

// Formatting
function fmt(command, value = null) {
    document.execCommand(command, false, value);
    focusLastEditor();
}

function focusLastEditor() {
    const editors = document.querySelectorAll('.page-editor');
    if (editors.length > 0) editors[editors.length - 1].focus();
}

// Insert Functions
function insertDivider() {
    document.execCommand('insertHTML', false, '<hr style="margin: 25px 0; border: 1px dashed #999;">');
}

function insertMCQBlock() {
    const html = `
        <div style="background:#f8f9fc; padding:16px 20px; border-radius:10px; margin:18px 0; border-left:5px solid #c9a84c;">
            <strong>📌 MCQ প্রশ্ন:</strong><br><br>
            _______________<br><br>
            ☐ ক &nbsp;&nbsp;&nbsp; ☐ খ<br>
            ☐ গ &nbsp;&nbsp;&nbsp; ☐ ঘ
        </div>`;
    document.execCommand('insertHTML', false, html);
}

function insertBlankLines() {
    const html = `<div style="margin:28px 0;">${'<div style="border-bottom:1px solid #ddd; height:52px; margin:14px 0;"></div>'.repeat(3)}</div>`;
    document.execCommand('insertHTML', false, html);
}

function insertTable() {
    const html = `
        <table style="width:100%; border-collapse:collapse; margin:15px 0;">
            <tr><th style="border:1px solid #ccc; padding:8px;">ক্রমিক</th><th style="border:1px solid #ccc; padding:8px;">বিষয়</th></tr>
            <tr><td style="border:1px solid #ccc; padding:8px;">1</td><td style="border:1px solid #ccc; padding:8px;"></td></tr>
        </table>`;
    document.execCommand('insertHTML', false, html);
}

// Create Multiple A4 Pages
function createPages() {
    pagesContainer.innerHTML = '';
    
    for (let i = 1; i <= pageCount; i++) {
        const page = document.createElement('div');
        page.className = 'a4-page';
        page.innerHTML = `
            <div class="page-number">পৃষ্ঠা ${i}</div>
            ${showWatermark.checked ? `<div class="editor-watermark">${watermarkText.value || 'Mahmud Sir'}</div>` : ''}
            <div class="page-editor" contenteditable="true" spellcheck="false"></div>
        `;
        pagesContainer.appendChild(page);
    }
    updateAllPagesFont();
}

// Generate Full Document for Preview & PDF
function generateFullDocument() {
    let allContent = '';
    document.querySelectorAll('.page-editor').forEach(editor => {
        if (editor.innerHTML.trim() !== '') {
            allContent += editor.innerHTML + '<br>';
        }
    });

    let html = '';
    const totalPages = 6;

    for (let i = 1; i <= totalPages; i++) {
        const isFirst = (i === 1);
        const isLast = (i === totalPages);

        html += `
        <div class="sheet-page" style="position:relative; page-break-after:always;">
            ${showWatermark.checked ? `
            <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-35deg); 
                        font-size:70pt; font-weight:900; color:rgba(15,31,69,0.07); white-space:nowrap; z-index:1;">
                ${watermarkText.value || 'Mahmud Sir'}
            </div>` : ''}
            
            <div class="sheet-header">
                <div>
                    <div class="sheet-school">⚓ Bangladesh Navy School And College, CTG</div>
                    <div class="sheet-meta">${sheetClass.value || 'Class'} | ${sheetSubject.value || 'ICT'}</div>
                </div>
                <div class="sheet-header-right">
                    ${teacherName.value || 'Mahmud'}<br>
                    📞 ${teacherMobile.value || ''}
                </div>
            </div>
            
            ${isFirst ? `
            <div class="sheet-title-bar">
                <div class="sheet-title-text">📖 ${sheetTitle.value || 'Worksheet'}</div>
                <div class="sheet-type-badge">${sheetType.options[sheetType.selectedIndex]?.text || 'Question'}</div>
            </div>` : ''}
            
            <div class="sheet-body">${allContent}</div>
            
            ${isLast && showTeacherSignature?.checked ? `
            <div style="margin-top:60px; text-align:right;">
                <div style="display:inline-block; text-align:left; background:#f8f9fc; padding:18px 28px; border-radius:12px; border-left:5px solid #c9a84c;">
                    <strong>✍️ ${document.getElementById('teacherFullName')?.value || 'S. M. Mahmud Hasan'}</strong><br>
                    Assistant Teacher (ICT)<br>
                    Bangladesh Navy School and College, CTG
                </div>
            </div>` : ''}
            
            ${showPageNum.checked ? `
            <div class="sheet-footer">
                <div class="sheet-page-num">পৃষ্ঠা ${i} / ${totalPages}</div>
            </div>` : ''}
        </div>`;
    }
    return html;
}

function previewSheet() {
    document.getElementById('previewContent').innerHTML = generateFullDocument();
    document.getElementById('previewModal').classList.remove('hidden');
}

function downloadPDF() {
    const fullHTML = generateFullDocument();
    const win = window.open('', '_blank');
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${sheetTitle.value || 'Sheet'}</title>
            <style>
                @page { size: A4; margin: 0; }
                body { margin:0; padding:20px; background:#f0f0f0; }
                .sheet-page { width:210mm; min-height:297mm; margin:15px auto; background:white; padding:18mm; position:relative; box-shadow:0 4px 20px rgba(0,0,0,0.1); }
                @media print { body {padding:0; background:white;} .sheet-page {margin:0; box-shadow:none; page-break-after:always;} }
            </style>
        </head>
        <body>${fullHTML}</body>
        </html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 800);
    closeModal('downloadModal');
}

function downloadDOCX() {
    alert("DOCX ফিচার এখনো সম্পূর্ণ হয়নি। PDF ব্যবহার করুন।");
    closeModal('downloadModal');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

// Auto Save (basic)
function autoSave() {
    localStorage.setItem('sheetMakerContent', JSON.stringify({
        title: sheetTitle.value,
        subject: sheetSubject.value,
        class: sheetClass.value,
        content: Array.from(document.querySelectorAll('.page-editor')).map(el => el.innerHTML)
    }));
}

// Initialize
function init() {
    createPages();

    // Event Listeners
    fontChoice.addEventListener('change', updateAllPagesFont);
    
    // Modal outside click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal.id);
        });
    });

    console.log("✅ Advanced A4 Sheet Maker Loaded Successfully");
}

document.addEventListener('DOMContentLoaded', init);
