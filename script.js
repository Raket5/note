// =============================================
// SHEET MAKER — script.js (Final)
// Fixed: Watermark on all pages, Sequential page numbers
// =============================================

// DOM Elements
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

// Add teacher fields dynamically
function addTeacherFields() {
    const teacherSection = document.querySelector('.sidebar-section:nth-child(2)');
    
    if (!document.getElementById('teacherFullName')) {
        const desigHTML = `
            <label class="field-label" style="margin-top:10px;">Full Name (পূর্ণ নাম)</label>
            <input type="text" id="teacherFullName" class="field-input" placeholder="e.g. S. M. Mahmud Hasan" value="S. M. Mahmud Hasan" />
            
            <label class="field-label" style="margin-top:10px;">Designation (পদবি)</label>
            <input type="text" id="teacherDesignation" class="field-input" placeholder="e.g. Assistant Teacher (ICT)" value="Assistant Teacher (ICT)" />
            
            <label class="field-label" style="margin-top:10px;">Subject (বিষয়)</label>
            <input type="text" id="teacherSubject" class="field-input" placeholder="e.g. ICT" value="Information & Communication Technology" />
        `;
        teacherSection.insertAdjacentHTML('beforeend', desigHTML);
    }
}

setTimeout(addTeacherFields, 100);

function getFontFamily() {
    return fontChoice.value === 'hind' 
        ? "'Hind Siliguri', 'Inter', sans-serif" 
        : "'Inter', 'Hind Siliguri', sans-serif";
}

function updateFontPreview() {
    contentEditor.style.fontFamily = getFontFamily();
}

// Editor formatting functions
function fmt(command, value = null) {
    if (command === 'fontSize') {
        document.execCommand('fontSize', false, value);
    } else {
        document.execCommand(command, false, null);
    }
    contentEditor.focus();
}

function insertDivider() {
    document.execCommand('insertHTML', false, '<hr style="margin: 20px 0; border: 1px dashed #ccc;">');
}

function insertMCQBlock() {
    const mcqHTML = `
        <div style="background: #f8f9fc; padding: 12px 16px; border-radius: 10px; margin: 16px 0; border-left: 4px solid #c9a84c;">
            <strong>📌 MCQ প্রশ্ন:</strong><br>
            _______________<br><br>
            <span style="display: inline-block; width: 45%;">☐ ক</span>
            <span style="display: inline-block; width: 45%;">☐ খ</span><br>
            <span style="display: inline-block; width: 45%;">☐ গ</span>
            <span style="display: inline-block; width: 45%;">☐ ঘ</span>
        </div>
    `;
    document.execCommand('insertHTML', false, mcqHTML);
}

function insertBlankLines() {
    const linesHTML = `
        <div style="margin: 16px 0;">
            <div style="border-bottom: 1px solid #ddd; margin: 8px 0; padding-bottom: 25px;"></div>
            <div style="border-bottom: 1px solid #ddd; margin: 8px 0; padding-bottom: 25px;"></div>
            <div style="border-bottom: 1px solid #ddd; margin: 8px 0; padding-bottom: 25px;"></div>
        </div>
    `;
    document.execCommand('insertHTML', false, linesHTML);
}

function insertTable() {
    const tableHTML = `
        <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
            <tr><th style="border: 1px solid #ccc; padding: 8px;">ক্রমিক</th><th style="border: 1px solid #ccc; padding: 8px;">বিষয়</th></tr>
            <tr><td style="border: 1px solid #ccc; padding: 8px;">1</td><td style="border: 1px solid #ccc; padding: 8px;">&nbsp;</td></tr>
            <tr><td style="border: 1px solid #ccc; padding: 8px;">2</td><td style="border: 1px solid #ccc; padding: 8px;">&nbsp;</td></tr>
        </table>
    `;
    document.execCommand('insertHTML', false, tableHTML);
}

// Generate Signature HTML
function getSignatureHTML() {
    const fullName = document.getElementById('teacherFullName')?.value || teacherName.value || 'S. M. Mahmud Hasan';
    const designation = document.getElementById('teacherDesignation')?.value || 'Assistant Teacher (ICT)';
    const whatsapp = teacherWhatsapp.value || '01883100648';
    
    return `
        <div style="margin-top: 40px; text-align: right;">
            <div style="display: inline-block; text-align: left; background: #f8f9fc; padding: 12px 20px; border-radius: 10px; border-left: 4px solid #c9a84c; min-width: 280px;">
                <div style="margin-bottom: 6px;"><strong style="font-size: 11pt;">✍️ ${fullName}</strong></div>
                <div style="margin-bottom: 4px; font-size: 9pt;">💻 ${designation}</div>
                <div style="margin-bottom: 4px; font-size: 9pt;">🏫 Bangladesh Noubahini School and College, CTG</div>
                <div style="font-size: 9pt;">📱 WhatsApp: ${whatsapp}</div>
                <div style="margin-top: 6px; height: 1px; background: linear-gradient(90deg, #c9a84c, transparent);"></div>
            </div>
        </div>
    `;
}

// Get watermark style (reusable)
function getWatermarkStyle() {
    if (!showWatermark.checked) return '';
    const watermark = watermarkText.value || 'Mahmud Sir';
    return `
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-25deg); 
                    font-size: 70pt; font-weight: 900; color: rgba(15,31,69,0.08); 
                    white-space: nowrap; pointer-events: none; letter-spacing: 5px; 
                    z-index: 1; font-family: Arial, sans-serif;">
            ${watermark}
        </div>
    `;
}

// Split content into pages based on height
function splitIntoPages(contentHTML) {
    // Create a temporary div to measure content height
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = 'position: absolute; visibility: hidden; width: 174mm; font-size: 11pt; line-height: 1.5; padding: 18mm 18mm 15mm; font-family: ' + getFontFamily() + ';';
    tempDiv.innerHTML = contentHTML;
    document.body.appendChild(tempDiv);
    
    // A4 page content height approx 257mm (297mm - 40mm padding)
    const maxHeight = 257;
    const actualHeight = tempDiv.offsetHeight / 3.78; // convert px to mm approx
    document.body.removeChild(tempDiv);
    
    // Calculate number of pages
    let numPages = Math.max(1, Math.ceil(actualHeight / maxHeight));
    if (numPages > 10) numPages = 10;
    
    // Split content simply - for now, return array with same content
    // For multiple pages, we'll duplicate structure
    let pages = [];
    for (let i = 0; i < numPages; i++) {
        pages.push(contentHTML);
    }
    return pages;
}

// Generate a single page
function generateSinglePage(contentHTML, pageNum, totalPages) {
    const isLastPage = (pageNum === totalPages);
    const font = getFontFamily();
    const typeDisplay = sheetType.options[sheetType.selectedIndex]?.text || 'Worksheet';
    const titleText = sheetTitle.value || `${sheetSubject.value || 'Subject'} — Worksheet`;
    
    // Signature - only on last page
    let signatureHTML = '';
    if (showTeacherSignature && showTeacherSignature.checked && isLastPage) {
        signatureHTML = getSignatureHTML();
    }
    
    // Page number
    let pageNumHTML = '';
    if (showPageNum && showPageNum.checked) {
        pageNumHTML = `
            <div style="text-align: center; font-size: 9pt; color: #888; margin-top: 30px; padding-top: 10px; border-top: 1px solid #e0e0e0;">
                পৃষ্ঠা ${pageNum} / ${totalPages}
            </div>
        `;
    }
    
    // For first page only, show title bar
    const isFirstPage = (pageNum === 1);
    
    return `
        <div class="sheet-page" style="font-family: ${font}; position: relative; background: white; min-height: 297mm; padding: 18mm 18mm 15mm; page-break-after: always; break-inside: avoid;">
            ${getWatermarkStyle()}
            
            <div class="sheet-header" style="position: relative; z-index: 2; border-bottom: 2.5px solid #0f1f45; padding-bottom: 10px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    <div style="font-size: 13pt; font-weight: 700; color: #0f1f45;">⚓ Bangladesh Navy School And College, CTG</div>
                    <div style="font-size: 8.5pt; color: #555; margin-top: 3px;">${sheetClass.value || 'Class — Section'} | ${sheetSubject.value || 'Subject'}</div>
                </div>
                <div style="text-align: right; font-size: 8.5pt; color: #555;">
                    ${teacherName.value || 'Mahmud'}<br>
                    📞 ${teacherMobile.value || ''}
                </div>
            </div>
            
            ${isFirstPage ? `
            <div class="sheet-title-bar" style="background: #0f1f45; color: #fff; padding: 8px 14px; border-radius: 8px; margin: 15px 0 20px 0; display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 2;">
                <div style="font-weight: 700; font-size: 11pt;">📖 ${titleText}</div>
                <div style="background: #c9a84c; color: #0f1f45; padding: 2px 12px; border-radius: 20px; font-size: 8pt; font-weight: 700;">${typeDisplay}</div>
            </div>
            ` : ''}
            
            <div class="sheet-body" style="line-height: 1.8; position: relative; z-index: 2;">
                ${contentHTML}
            </div>
            
            ${signatureHTML}
            ${pageNumHTML}
        </div>
    `;
}

// Generate full document with multiple pages
function generateFullDocument() {
    const contentHTML = contentEditor.innerHTML || '<p style="color: #999;">[কোন কন্টেন্ট যোগ করা হয়নি]</p>';
    
    // Simple content splitting - for now, single page
    // For multi-page support, we need to split content intelligently
    let pages = splitIntoPages(contentHTML);
    
    let fullHTML = '';
    for (let i = 0; i < pages.length; i++) {
        fullHTML += generateSinglePage(pages[i], i + 1, pages.length);
    }
    
    return fullHTML;
}

// PDF Download
function downloadPDF() {
    try {
        const fullHTML = generateFullDocument();
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${sheetTitle.value || 'Worksheet'} - ${teacherName.value}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        background: #e0e0e0;
                        padding: 20px;
                    }
                    .sheet-page {
                        width: 210mm;
                        min-height: 297mm;
                        margin: 0 auto 20px;
                        background: white;
                        padding: 18mm 18mm 15mm;
                        box-shadow: 0 0 8px rgba(0,0,0,0.1);
                        position: relative;
                        font-size: 11pt;
                        line-height: 1.5;
                        page-break-after: always;
                    }
                    @media print {
                        @page {
                            size: A4;
                            margin: 0;
                        }
                        body {
                            padding: 0;
                            margin: 0;
                            background: white;
                        }
                        .sheet-page {
                            margin: 0;
                            box-shadow: none;
                            page-break-after: always;
                        }
                    }
                    table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 12px 0;
                    }
                    table td, table th {
                        border: 1px solid #ccc;
                        padding: 8px;
                    }
                    table th {
                        background: #f0f2f8;
                    }
                    img {
                        max-width: 100%;
                    }
                </style>
            </head>
            <body>
                ${fullHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
        }, 500);
        
        closeModal('downloadModal');
    } catch (error) {
        console.error('PDF Error:', error);
        alert('PDF তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
}

// DOCX Download
function downloadDOCX() {
    try {
        const content = contentEditor.innerHTML || '<p>No content added</p>';
        const font = getFontFamily();
        const watermark = showWatermark.checked ? watermarkText.value || 'Mahmud Sir' : '';
        const typeDisplay = sheetType.options[sheetType.selectedIndex]?.text || 'Worksheet';
        const titleText = sheetTitle.value || `${sheetSubject.value || 'Subject'} — Worksheet`;
        
        const fullName = document.getElementById('teacherFullName')?.value || teacherName.value || 'S. M. Mahmud Hasan';
        const designation = document.getElementById('teacherDesignation')?.value || 'Assistant Teacher (ICT)';
        const whatsapp = teacherWhatsapp.value || '01883100648';
        
        const signatureBlock = (showTeacherSignature && showTeacherSignature.checked) ? `
            <div style="margin-top: 40px; text-align: right;">
                <div style="display: inline-block; text-align: left; background: #f8f9fc; padding: 12px 20px; border-radius: 10px; border-left: 4px solid #c9a84c;">
                    <div style="margin-bottom: 6px;"><strong>✍️ ${fullName}</strong></div>
                    <div style="margin-bottom: 4px;">💻 ${designation}</div>
                    <div style="margin-bottom: 4px;">🏫 Bangladesh Noubahini School and College, CTG</div>
                    <div>📱 WhatsApp: ${whatsapp}</div>
                </div>
            </div>
        ` : '';
        
        const watermarkStyle = watermark ? `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-25deg); 
                        font-size: 80pt; font-weight: 900; color: rgba(15,31,69,0.08); 
                        white-space: nowrap; letter-spacing: 5px; z-index: 999; pointer-events: none;">
                ${watermark}
            </div>
        ` : '';
        
        const pageNumber = (showPageNum && showPageNum.checked) ? 
            `<div style="text-align: center; font-size: 9pt; color: #888; margin-top: 30px; padding-top: 10px; border-top: 1px solid #e0e0e0;">পৃষ্ঠা 1</div>` : '';
        
        const docHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${titleText}</title>
                <style>
                    body {
                        font-family: ${font};
                        margin: 2.5cm;
                        line-height: 1.6;
                        position: relative;
                    }
                    .header {
                        border-bottom: 2px solid #0f1f45;
                        padding-bottom: 10px;
                        margin-bottom: 20px;
                        display: flex;
                        justify-content: space-between;
                    }
                    .school-name {
                        font-size: 14pt;
                        font-weight: bold;
                        color: #0f1f45;
                    }
                    .title-bar {
                        background: #0f1f45;
                        color: white;
                        padding: 8px 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                        display: flex;
                        justify-content: space-between;
                    }
                    table { border-collapse: collapse; width: 100%; margin: 15px 0; }
                    td, th { border: 1px solid #aaa; padding: 8px; }
                </style>
            </head>
            <body>
                ${watermarkStyle}
                
                <div class="header">
                    <div>
                        <div class="school-name">⚓ Bangladesh Navy School And College, CTG</div>
                        <div style="font-size: 9pt; color: #555;">${sheetClass.value || 'Class — Section'} | ${sheetSubject.value || 'Subject'}</div>
                    </div>
                    <div style="text-align: right; font-size: 9pt; color: #555;">
                        ${teacherName.value || 'Mahmud'}<br>
                        📞 ${teacherMobile.value || ''}
                    </div>
                </div>
                
                <div class="title-bar">
                    <span><strong>📖 ${titleText}</strong></span>
                    <span style="background: #c9a84c; color: #0f1f45; padding: 2px 12px; border-radius: 20px; font-size: 8pt;">${typeDisplay}</span>
                </div>
                
                <div>${content}</div>
                
                ${signatureBlock}
                ${pageNumber}
            </body>
            </html>
        `;
        
        const blob = new Blob([docHTML], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${titleText.replace(/[^a-z0-9]/gi, '_')}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        closeModal('downloadModal');
    } catch (error) {
        console.error('DOCX Error:', error);
        alert('Word ডকুমেন্ট তৈরি করতে সমস্যা হয়েছে।');
    }
}

function previewSheet() {
    const fullHTML = generateFullDocument();
    const previewContainer = document.getElementById('previewContent');
    previewContainer.innerHTML = fullHTML;
    document.getElementById('previewModal').classList.remove('hidden');
}

function openDownloadModal() {
    document.getElementById('downloadModal').classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Auto-save
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
        teacherSubject: document.getElementById('teacherSubject')?.value || '',
        teacherMobile: teacherMobile.value,
        teacherWhatsapp: teacherWhatsapp.value,
        fontChoice: fontChoice.value,
        watermarkText: watermarkText.value,
        showWatermark: showWatermark.checked,
        showPageNum: showPageNum.checked,
        showTeacherSignature: showTeacherSignature ? showTeacherSignature.checked : true
    };
    localStorage.setItem('sheetMakerData', JSON.stringify(saveData));
}

function loadSavedData() {
    const saved = localStorage.getItem('sheetMakerData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            contentEditor.innerHTML = data.content || '';
            sheetTitle.value = data.sheetTitle || '';
            sheetSubject.value = data.sheetSubject || 'ICT';
            sheetClass.value = data.sheetClass || '';
            sheetType.value = data.sheetType || 'question';
            teacherName.value = data.teacherName || 'Mahmud';
            if (document.getElementById('teacherFullName')) {
                document.getElementById('teacherFullName').value = data.teacherFullName || 'S. M. Mahmud Hasan';
            }
            if (document.getElementById('teacherDesignation')) {
                document.getElementById('teacherDesignation').value = data.teacherDesignation || 'Assistant Teacher (ICT)';
            }
            if (document.getElementById('teacherSubject')) {
                document.getElementById('teacherSubject').value = data.teacherSubject || 'Information & Communication Technology';
            }
            teacherMobile.value = data.teacherMobile || '01883100648';
            teacherWhatsapp.value = data.teacherWhatsapp || '01883100648';
            fontChoice.value = data.fontChoice || 'hind';
            watermarkText.value = data.watermarkText || 'Mahmud Sir';
            showWatermark.checked = data.showWatermark !== false;
            showPageNum.checked = data.showPageNum !== false;
            if (showTeacherSignature) showTeacherSignature.checked = data.showTeacherSignature !== false;
            updateFontPreview();
        } catch(e) { console.log('Load error:', e); }
    }
}

function init() {
    addTeacherFields();
    setTimeout(() => loadSavedData(), 100);
    updateFontPreview();
    
    const inputs = [sheetTitle, sheetSubject, sheetClass, sheetType, teacherName, teacherMobile, teacherWhatsapp, fontChoice, watermarkText];
    inputs.forEach(input => {
        if (input) input.addEventListener('input', () => autoSave());
    });
    
    setInterval(() => {
        const fields = ['teacherFullName', 'teacherDesignation', 'teacherSubject'];
        fields.forEach(field => {
            const el = document.getElementById(field);
            if (el && !el._listener) {
                el.addEventListener('input', () => autoSave());
                el._listener = true;
            }
        });
    }, 500);
    
    if (showWatermark) showWatermark.addEventListener('change', () => autoSave());
    if (showPageNum) showPageNum.addEventListener('change', () => autoSave());
    if (showTeacherSignature) showTeacherSignature.addEventListener('change', () => autoSave());
    if (contentEditor) contentEditor.addEventListener('input', () => autoSave());
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay').forEach(modal => {
                modal.classList.add('hidden');
            });
        }
    });
    
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', init);
