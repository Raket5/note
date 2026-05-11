// =============================================
// SHEET MAKER — script.js (Optimized)
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

// ১. ফন্ট এবং এডিটর সেটআপ
function updateFontPreview() {
    contentEditor.style.fontFamily = fontChoice.value === 'hind' 
        ? "'Hind Siliguri', sans-serif" 
        : "'Inter', sans-serif";
}

function fmt(command, value = null) {
    document.execCommand(command, false, value);
    contentEditor.focus();
}

// ২. কন্টেন্ট ব্লক ফাংশনস
function insertDivider() {
    document.execCommand('insertHTML', false, '<hr style="margin: 20px 0; border: 1px dashed #ccc;">');
}

function insertMCQBlock() {
    const html = `<div style="background: #f8f9fc; padding: 12px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #c9a84c;">
        <strong>📌 প্রশ্ন:</strong> _______________<br>
        <span style="display:inline-block; width:45%;">☐ ক) </span><span style="display:inline-block; width:45%;">☐ খ) </span><br>
        <span style="display:inline-block; width:45%;">☐ গ) </span><span style="display:inline-block; width:45%;">☐ ঘ) </span>
    </div><p></p>`;
    document.execCommand('insertHTML', false, html);
}

function insertBlankLines() {
    const html = `<div style="margin: 15px 0; border-bottom: 1px solid #ddd; padding-bottom: 25px;"></div>`.repeat(3);
    document.execCommand('insertHTML', false, html);
}

function insertTable() {
    const html = `<table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
        <tr><th style="border: 1px solid #ccc; padding: 8px; background: #f0f2f8;">SL</th><th style="border: 1px solid #ccc; padding: 8px; background: #f0f2f8;">Topic</th></tr>
        <tr><td style="border: 1px solid #ccc; padding: 8px;">1</td><td style="border: 1px solid #ccc; padding: 8px;">&nbsp;</td></tr>
    </table><p></p>`;
    document.execCommand('insertHTML', false, html);
}

// ৩. অটোমেটিক পেজ স্প্লিটিং লজিক (মাঝখানের ফাঁকা অংশ দূর করার সমাধান)
function generateFullDocument() {
    const contentHTML = contentEditor.innerHTML || '<p>[No content]</p>';
    
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = `width: 174mm; visibility: hidden; position: absolute; line-height: 1.8; font-family: ${contentEditor.style.fontFamily};`;
    tempDiv.innerHTML = contentHTML;
    document.body.appendChild(tempDiv);

    const nodes = Array.from(tempDiv.childNodes);
    let pages = [];
    let currentHTML = "";
    let currentHeight = 0;
    const maxHeight = 860; // A4 এর কার্যকরী উচ্চতা (px)

    nodes.forEach(node => {
        let nodeHeight = 0;
        let nodeHTML = "";

        if (node.nodeType === 3) { // Text Node
            if (node.textContent.trim() === "") return;
            nodeHTML = node.textContent;
            nodeHeight = 20; 
        } else { // Element Node
            nodeHTML = node.outerHTML;
            nodeHeight = node.offsetHeight || 30;
        }

        if (currentHeight + nodeHeight > maxHeight) {
            pages.push(currentHTML);
            currentHTML = nodeHTML;
            currentHeight = nodeHeight;
        } else {
            currentHTML += nodeHTML;
            currentHeight += nodeHeight;
        }
    });

    if (currentHTML) pages.push(currentHTML);
    document.body.removeChild(tempDiv);
    
    let finalHTML = "";
    pages.forEach((html, i) => finalHTML += generateSinglePage(html, i + 1, pages.length));
    return finalHTML;
}

// ৪. পেজ জেনারেটর
function generateSinglePage(content, pageNum, total) {
    const isFirst = pageNum === 1;
    const isLast = pageNum === total;
    const watermark = showWatermark.checked ? (watermarkText.value || 'Mahmud Sir') : '';
    
    const signature = (showTeacherSignature.checked && isLast) ? `
        <div style="margin-top: 30px; text-align: right;">
            <div style="display: inline-block; text-align: left; background: #f8f9fc; padding: 12px; border-radius: 8px; border-left: 4px solid #c9a84c;">
                <strong>✍️ ${document.getElementById('teacherFullName').value}</strong><br>
                <small>${document.getElementById('teacherDesignation').value}</small><br>
                <small>📱 ${teacherWhatsapp.value}</small>
            </div>
        </div>` : '';

    return `
        <div class="sheet-page">
            ${watermark ? `<div class="sheet-watermark">${watermark}</div>` : ''}
            
            <div class="sheet-header">
                <div>
                    <div class="sheet-school">⚓ Bangladesh Navy School And College, CTG</div>
                    <div class="sheet-meta">${sheetClass.value} | ${sheetSubject.value}</div>
                </div>
                <div class="sheet-header-right">${teacherName.value}<br>📞 ${teacherMobile.value}</div>
            </div>

            ${isFirst ? `
            <div class="sheet-title-bar">
                <div class="sheet-title-text">📖 ${sheetTitle.value || 'Untitled'}</div>
                <span class="sheet-type-badge">${sheetType.options[sheetType.selectedIndex].text}</span>
            </div>` : ''}

            <div class="sheet-body">${content}</div>
            
            ${signature}
            ${showPageNum.checked ? `<div class="sheet-page-num">পৃষ্ঠা: ${pageNum} / ${total}</div>` : ''}
        </div>
    `;
}

// ৫. একশন ফাংশনস
function previewSheet() {
    document.getElementById('previewContent').innerHTML = generateFullDocument();
    document.getElementById('previewModal').classList.remove('hidden');
}

function downloadPDF() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><head><link rel="stylesheet" href="style.css"></head><body>${generateFullDocument()}</body></html>`);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); closeModal('downloadModal'); }, 500);
}

function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function openDownloadModal() { document.getElementById('downloadModal').classList.remove('hidden'); }

// ৬. অটো সেভ
function autoSave() {
    const data = { content: contentEditor.innerHTML, title: sheetTitle.value, sub: sheetSubject.value };
    localStorage.setItem('sheetData', JSON.stringify(data));
}

document.addEventListener('DOMContentLoaded', () => {
    const saved = JSON.parse(localStorage.getItem('sheetData') || '{}');
    if(saved.content) contentEditor.innerHTML = saved.content;
    updateFontPreview();
    contentEditor.addEventListener('input', autoSave);
});
