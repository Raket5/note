// =============================================
// SHEET MAKER — Final Improved script.js
// Fixed: Watermark on ALL pages, Page Number on ALL pages, Better Editor
// =============================================

const contentEditor = document.getElementById('contentEditor');
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

// Add teacher fields if missing
function addTeacherFields() {
    if (document.getElementById('teacherFullName')) return;
    
    const teacherSection = document.querySelector('.sidebar-section:nth-child(2)');
    const desigHTML = `
        <label class="field-label" style="margin-top:10px;">Full Name (পূর্ণ নাম)</label>
        <input type="text" id="teacherFullName" class="field-input" value="S. M. Mahmud Hasan" />
        
        <label class="field-label" style="margin-top:10px;">Designation (পদবি)</label>
        <input type="text" id="teacherDesignation" class="field-input" value="Assistant Teacher (ICT)" />
        
        <label class="field-label" style="margin-top:10px;">Subject (বিষয়)</label>
        <input type="text" id="teacherSubject" class="field-input" value="Information & Communication Technology" />
    `;
    teacherSection.insertAdjacentHTML('beforeend', desigHTML);
}

// Font Family
function getFontFamily() {
    return fontChoice.value === 'hind' 
        ? "'Hind Siliguri', 'Inter', sans-serif" 
        : "'Inter', 'Hind Siliguri', sans-serif";
}

function updateFontPreview() {
    contentEditor.style.fontFamily = getFontFamily();
}

// Formatting Functions
function fmt(command, value = null) {
    if (command === 'fontSize') {
        document.execCommand('fontSize', false, value);
    } else {
        document.execCommand(command, false, null);
    }
    contentEditor.focus();
}

function insertDivider() {
    document.execCommand('insertHTML', false, '<hr style="margin: 25px 0; border: 1px dashed #ccc;">');
}

function insertMCQBlock() {
    const mcqHTML = `
        <div style="background: #f8f9fc; padding: 14px 18px; border-radius: 10px; margin: 18px 0; border-left: 5px solid #c9a84c;">
            <strong>📌 MCQ প্রশ্ন:</strong><br><br>
            _______________<br><br>
            <span style="display: inline-block; width: 48%;">☐ ক</span>
            <span style="display: inline-block; width: 48%;">☐ খ</span><br>
            <span style="display: inline-block; width: 48%;">☐ গ</span>
            <span style="display: inline-block; width: 48%;">☐ ঘ</span>
        </div>
    `;
    document.execCommand('insertHTML', false, mcqHTML);
}

function insertBlankLines() {
    const linesHTML = `
        <div style="margin: 20px 0;">
            <div style="border-bottom: 1px solid #ddd; height: 40px; margin: 12px 0;"></div>
            <div style="border-bottom: 1px solid #ddd; height: 40px; margin: 12px 0;"></div>
            <div style="border-bottom: 1px solid #ddd; height: 40px; margin: 12px 0;"></div>
        </div>
    `;
    document.execCommand('insertHTML', false, linesHTML);
}

function insertTable() {
    const tableHTML = `
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr><th style="border: 1px solid #ccc; padding: 8px;">ক্রমিক</th><th style="border: 1px solid #ccc; padding: 8px;">বিষয়</th></tr>
            <tr><td style="border: 1px solid #ccc; padding: 8px;">1</td><td style="border: 1px solid #ccc; padding: 8px;">&nbsp;</td></tr>
        </table>
    `;
    document.execCommand('insertHTML', false, tableHTML);
}

// Signature
function getSignatureHTML() {
    const fullName = document.getElementById('teacherFullName')?.value || teacherName.value || 'S. M. Mahmud Hasan';
    const designation = document.getElementById('teacherDesignation')?.value || 'Assistant Teacher (ICT)';
    const whatsapp = teacherWhatsapp.value || '01883100648';
    
    return `
        <div style="margin-top: 50px; text-align: right;">
            <div style="display: inline-block; text-align: left; background: #f8f9fc; padding: 15px 25px; border-radius: 10px; border-left: 5px solid #c9a84c; min-width: 300px;">
                <strong style="font-size: 12pt;">✍️ ${fullName}</strong><br>
                <span style="font-size: 9.5pt;">${designation}</span><br>
                <span style="font-size: 9.5pt;">Bangladesh Navy School and College, CTG</span><br>
                <span style="font-size: 9.5pt;">📱 WhatsApp: ${whatsapp}</span>
            </div>
        </div>
    `;
}

// Watermark (Now on ALL pages)
function getWatermarkStyle() {
    if (!showWatermark.checked) return '';
    const wm = watermarkText.value.trim() || 'Mahmud Sir';
    return `
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); 
                    font-size: 68pt; font-weight: 900; color: rgba(15,31,69,0.07); 
                    white-space: nowrap; pointer-events: none; letter-spacing: 6px; z-index: 1;">
            ${wm}
        </div>
    `;
}

// Generate Full Document
function generateFullDocument() {
    const contentHTML = contentEditor.innerHTML || '<p style="color:#999; text-align:center; padding:50px 0;">[কোন কন্টেন্ট যোগ করা হয়নি]</p>';
    
    let fullHTML = '';
    const totalPages = 6;   // আপাতত ৬ পেজ (পরে আরও ডায়নামিক করা যাবে)

    for (let i = 1; i <= totalPages; i++) {
        const isFirstPage = (i === 1);
        const isLastPage = (i === totalPages);

        fullHTML += `
        <div class="sheet-page" style="position: relative; page-break-after: always;">
            ${getWatermarkStyle()}
            
            <div class="sheet-header">
                <div>
                    <div class="sheet-school">⚓ Bangladesh Navy School And College, CTG</div>
                    <div class="sheet-meta">${sheetClass.value || 'Class — Section'} | ${sheetSubject.value || 'Subject'}</div>
                </div>
                <div class="sheet-header-right">
                    ${teacherName.value || 'Mahmud'}<br>
                    📞 ${teacherMobile.value || ''}
                </div>
            </div>
            
            ${isFirstPage ? `
            <div class="sheet-title-bar">
                <div class="sheet-title-text">📖 ${sheetTitle.value || 'Worksheet'}</div>
                <div class="sheet-type-badge">${sheetType.options[sheetType.selectedIndex]?.text || 'Worksheet'}</div>
            </div>` : ''}
            
            <div class="sheet-body">
                ${contentHTML}
            </div>
            
            ${isLastPage && showTeacherSignature.checked ? getSignatureHTML() : ''}
            
            ${showPageNum.checked ? `
            <div class="sheet-footer">
                <div class="sheet-page-num">পৃষ্ঠা ${i} / ${totalPages}</div>
            </div>` : ''}
        </div>`;
    }
    return fullHTML;
}

// PDF Download
function downloadPDF() {
    const fullHTML = generateFullDocument();
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${sheetTitle.value || 'Sheet'}</title>
            <style>
                @page { size: A4; margin: 0; }
                body { margin:0; padding:15px; background:#ddd; }
                .sheet-page { width:210mm; min-height:297mm; margin:15px auto; background:white; padding:18mm 18mm 24mm; position:relative; box-shadow:0 0 10px rgba(0,0,0,0.1); }
                @media print {
                    body { padding:0; background:white; }
                    .sheet-page { margin:0; box-shadow:none; page-break-after: always; }
                }
            </style>
        </head>
        <body>${fullHTML}</body>
        </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 700);
    closeModal('downloadModal');
}

// DOCX Download (simplified)
function downloadDOCX() {
    alert("DOCX এখনো পুরোপুরি আপডেট হয়নি। PDF ব্যবহার করুন।\n\nচাইলে পরে DOCX আরও ভালো করে দিতে পারি।");
    closeModal('downloadModal');
}

// Preview
function previewSheet() {
    const fullHTML = generateFullDocument();
    document.getElementById('previewContent').innerHTML = fullHTML;
    document.getElementById('previewModal').classList.remove('hidden');
}

function openDownloadModal() {
    document.getElementById('downloadModal').classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Auto Save & Load
function autoSave() {
    const saveData = {
        content: contentEditor.innerHTML,
        sheetTitle: sheetTitle.value,
        sheetSubject: sheetSubject.value,
        sheetClass: sheetClass.value,
        sheetType: sheetType.value,
        teacherName: teacherName.value,
        teacherFullName: document.getElementById('teacherFullName')?.value || '',
        teacherDesignation: document.getElementById('teacherDesignation')?.value || '',
        teacherMobile: teacherMobile.value,
        teacherWhatsapp: teacherWhatsapp.value,
        fontChoice: fontChoice.value,
        watermarkText: watermarkText.value,
        showWatermark: showWatermark.checked,
        showPageNum: showPageNum.checked,
        showTeacherSignature: showTeacherSignature.checked
    };
    localStorage.setItem('sheetMakerData', JSON.stringify(saveData));
}

function loadSavedData() {
    const saved = localStorage.getItem('sheetMakerData');
    if (!saved) return;
    try {
        const data = JSON.parse(saved);
        contentEditor.innerHTML = data.content || '';
        sheetTitle.value = data.sheetTitle || '';
        sheetSubject.value = data.sheetSubject || 'ICT';
        sheetClass.value = data.sheetClass || '';
        sheetType.value = data.sheetType || 'question';
        teacherName.value = data.teacherName || 'Mahmud';
        teacherMobile.value = data.teacherMobile || '01883100648';
        teacherWhatsapp.value = data.teacherWhatsapp || '01883100648';
        fontChoice.value = data.fontChoice || 'hind';
        watermarkText.value = data.watermarkText || 'Mahmud Sir';
        showWatermark.checked = data.showWatermark !== false;
        showPageNum.checked = data.showPageNum !== false;
        showTeacherSignature.checked = data.showTeacherSignature !== false;

        if (document.getElementById('teacherFullName')) document.getElementById('teacherFullName').value = data.teacherFullName || '';
        if (document.getElementById('teacherDesignation')) document.getElementById('teacherDesignation').value = data.teacherDesignation || '';
    } catch(e) {}
}

function init() {
    addTeacherFields();
    setTimeout(loadSavedData, 150);
    updateFontPreview();

    // Event Listeners
    const inputs = [sheetTitle, sheetSubject, sheetClass, sheetType, teacherName, teacherMobile, teacherWhatsapp, fontChoice, watermarkText];
    inputs.forEach(el => el && el.addEventListener('input', autoSave));
    
    contentEditor.addEventListener('input', autoSave);
    showWatermark.addEventListener('change', autoSave);
    showPageNum.addEventListener('change', autoSave);
    showTeacherSignature.addEventListener('change', autoSave);
}

document.addEventListener('DOMContentLoaded', init);
