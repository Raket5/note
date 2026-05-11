const contentEditor = document.getElementById('contentEditor');
const fontChoice = document.getElementById('fontChoice');

// ১. এডিটর টুলস
function fmt(command, value = null) {
    document.execCommand(command, false, value);
    contentEditor.focus();
}

function updateFont() {
    contentEditor.style.fontFamily = fontChoice.value === 'hind' ? "'Hind Siliguri', sans-serif" : "'Inter', sans-serif";
}

function insertTable() {
    let rows = prompt("Rows?", "2"), cols = prompt("Cols?", "2");
    if (!rows || !cols) return;
    let table = `<table style="width:100%; border-collapse:collapse; margin:10px 0;">`;
    for(let i=0; i<rows; i++) {
        table += `<tr>`;
        for(let j=0; j<cols; j++) table += `<td style="border:1px solid #ccc; padding:8px;">&nbsp;</td>`;
        table += `</tr>`;
    }
    table += `</table><p></p>`;
    document.execCommand('insertHTML', false, table);
}

function insertMCQ() {
    const html = `<div style="background:#f8f9fc; padding:15px; border-left:5px solid #c9a84c; margin:10px 0;">
        <strong>প্রশ্ন: </strong> এখানে লিখুন...<br>
        (ক) ____ &nbsp; (খ) ____ &nbsp; (গ) ____ &nbsp; (ঘ) ____
    </div><p></p>`;
    document.execCommand('insertHTML', false, html);
}

// ২. কন্টেন্ট ভাগ করার লজিক (মাঝখানের ফাঁকা অংশ দূর করবে)
function splitIntoPages() {
    const temp = document.createElement('div');
    temp.style.width = '174mm'; // Content width inside A4
    temp.style.visibility = 'hidden';
    temp.style.position = 'absolute';
    temp.style.lineHeight = '1.8';
    temp.innerHTML = contentEditor.innerHTML;
    document.body.appendChild(temp);

    const nodes = Array.from(temp.childNodes);
    const pages = [];
    let currentHTML = "";
    let currentH = 0;
    const maxH = 880; // Approximate px height for A4

    nodes.forEach(node => {
        let nodeH = (node.nodeType === 1) ? node.offsetHeight : 20;
        if (currentH + nodeH > maxH) {
            pages.push(currentHTML);
            currentHTML = (node.nodeType === 1) ? node.outerHTML : node.textContent;
            currentH = nodeH;
        } else {
            currentHTML += (node.nodeType === 1) ? node.outerHTML : node.textContent;
            currentH += nodeH;
        }
    });
    if (currentHTML) pages.push(currentHTML);
    document.body.removeChild(temp);
    return pages;
}

// ৩. পেজ ডিজাইন জেনারেটর
function generateSinglePage(html, num, total) {
    const watermark = document.getElementById('showWatermark').checked ? document.getElementById('watermarkText').value : '';
    const isLast = num === total;
    
    return `
        <div class="sheet-page">
            ${watermark ? `<div class="sheet-watermark">${watermark}</div>` : ''}
            <div class="sheet-header">
                <div>
                    <div class="sheet-school">⚓ Bangladesh Navy School And College, CTG</div>
                    <div style="font-size: 8.5pt; color: #555;">${document.getElementById('sheetClass').value} | ${document.getElementById('sheetSubject').value}</div>
                </div>
                <div style="text-align: right; font-size: 8.5pt; color: #555;">
                    ${document.getElementById('teacherName').value}<br>📞 ${document.getElementById('teacherMobile').value}
                </div>
            </div>
            <div class="sheet-body">${html}</div>
            ${document.getElementById('showTeacherSignature').checked && isLast ? `<div style="text-align:right; margin-top:30px;"><span style="border-top:1px solid #000; padding-top:5px; font-weight:600;">${document.getElementById('teacherDesignation').value}</span></div>` : ''}
            ${document.getElementById('showPageNum').checked ? `<div class="sheet-page-num">পৃষ্ঠা: ${num} / ${total}</div>` : ''}
        </div>`;
}

function previewSheet() {
    const pages = splitIntoPages();
    let finalHTML = "";
    pages.forEach((p, i) => finalHTML += generateSinglePage(p, i+1, pages.length));
    document.getElementById('previewContent').innerHTML = finalHTML;
    document.getElementById('previewModal').classList.remove('hidden');
}

function downloadPDF() {
    window.print();
}

function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function openDownloadModal() { document.getElementById('downloadModal').classList.remove('hidden'); }

// ৪. অটো সেভ
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('pro_sheet_content');
    if (saved) contentEditor.innerHTML = saved;
    contentEditor.addEventListener('input', () => {
        localStorage.setItem('pro_sheet_content', contentEditor.innerHTML);
    });
});
