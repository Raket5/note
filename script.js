// =============================================
// SHEET MAKER — script.js (Word Style)
// =============================================

const contentEditor = document.getElementById('contentEditor');
const sheetTitle = document.getElementById('sheetTitle');
const sheetSubject = document.getElementById('sheetSubject');
const sheetClass = document.getElementById('sheetClass');
const sheetType = document.getElementById('sheetType');
const teacherName = document.getElementById('teacherName');
const teacherMobile = document.getElementById('teacherMobile');
const fontChoice = document.getElementById('fontChoice');
const watermarkText = document.getElementById('watermarkText');
const showWatermark = document.getElementById('showWatermark');
const showPageNum = document.getElementById('showPageNum');
const showTeacherSignature = document.getElementById('showTeacherSignature');

// ১. এডিটর টুলস (Word এর মতো)
function fmt(command, value = null) {
    document.execCommand(command, false, value);
    contentEditor.focus();
}

function insertTable() {
    let rows = prompt("কয়টি সারি (Rows)?", "2");
    let cols = prompt("কয়টি কলাম (Cols)?", "2");
    if (!rows || !cols) return;
    let table = `<table style="width:100%; border-collapse:collapse; margin:10px 0;">`;
    for (let i = 0; i < rows; i++) {
        table += `<tr>`;
        for (let j = 0; j < cols; j++) {
            table += `<td style="border:1px solid #ccc; padding:8px;">&nbsp;</td>`;
        }
        table += `</tr>`;
    }
    table += `</table><p></p>`;
    document.execCommand('insertHTML', false, table);
}

function insertMCQ() {
    const html = `<div style="background:#f9f9f9; padding:15px; border-left:5px solid #c9a84c; margin:10px 0;">
        <strong>প্রশ্ন: </strong> এখানে লিখুন...<br>
        (ক) অপশন ১ &nbsp; (খ) অপশন ২ &nbsp; (গ) অপশন ৩ &nbsp; (ঘ) অপশন ৪
    </div><p></p>`;
    document.execCommand('insertHTML', false, html);
}

// ২. পেজ স্প্লিটিং অ্যালগরিদম (মাঝখানের ফাঁকা অংশ দূর করার জন্য)
function generateFullDocument() {
    const content = contentEditor.innerHTML;
    const tempDiv = document.createElement('div');
    tempDiv.style.width = '174mm'; // A4 content width
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.position = 'absolute';
    tempDiv.innerHTML = content;
    document.body.appendChild(tempDiv);

    const nodes = Array.from(tempDiv.childNodes);
    let pages = [];
    let currentHTML = "";
    let currentHeight = 0;
    const maxHeight = 880; // A4 height limit in px

    nodes.forEach(node => {
        let h = (node.nodeType === 1) ? node.offsetHeight : 20;
        if (currentHeight + h > maxHeight) {
            pages.push(currentHTML);
            currentHTML = (node.nodeType === 1) ? node.outerHTML : node.textContent;
            currentHeight = h;
        } else {
            currentHTML += (node.nodeType === 1) ? node.outerHTML : node.textContent;
            currentHeight += h;
        }
    });
    if (currentHTML) pages.push(currentHTML);
    document.body.removeChild(tempDiv);

    let finalHTML = "";
    pages.forEach((p, i) => finalHTML += generateSinglePage(p, i + 1, pages.length));
    return finalHTML;
}

function generateSinglePage(html, num, total) {
    const watermark = showWatermark.checked ? (watermarkText.value || 'Mahmud Sir') : '';
    const isLast = num === total;
    
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
            <div class="sheet-body">${html}</div>
            ${showTeacherSignature.checked && isLast ? `<div style="text-align:right; margin-top:20px;"><span style="border-top:1px solid #000; padding-top:5px;">Signature</span></div>` : ''}
            ${showPageNum.checked ? `<div class="sheet-page-num">পৃষ্ঠা: ${num} / ${total}</div>` : ''}
        </div>`;
}

// ৩. একশনস
function previewSheet() {
    document.getElementById('previewContent').innerHTML = generateFullDocument();
    document.getElementById('previewModal').classList.remove('hidden');
}

function downloadPDF() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><head><link rel="stylesheet" href="style.css"></head><body>${generateFullDocument()}</body></html>`);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
}

function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function openDownloadModal() { document.getElementById('downloadModal').classList.remove('hidden'); }

// ৪. অটোসেভ ও লোড
function autoSave() {
    const data = { content: contentEditor.innerHTML, title: sheetTitle.value };
    localStorage.setItem('sheetData', JSON.stringify(data));
}

document.addEventListener('DOMContentLoaded', () => {
    const saved = JSON.parse(localStorage.getItem('sheetData') || '{}');
    if (saved.content) contentEditor.innerHTML = saved.content;
    contentEditor.addEventListener('input', autoSave);
});
