// =============================================
// SHEET MAKER — script.js
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

// ১. ডাইনামিক ফিল্ডস এবং ফন্ট সেটআপ
function addTeacherFields() {
    const teacherSection = document.querySelector('.sidebar-section:nth-child(2)');
    if (!document.getElementById('teacherFullName')) {
        const desigHTML = `
            <label class="field-label" style="margin-top:10px;">Full Name (পূর্ণ নাম)</label>
            <input type="text" id="teacherFullName" class="field-input" value="S. M. Mahmud Hasan" />
            <label class="field-label" style="margin-top:10px;">Designation (পদবি)</label>
            <input type="text" id="teacherDesignation" class="field-input" value="Assistant Teacher (ICT)" />
        `;
        teacherSection.insertAdjacentHTML('beforeend', desigHTML);
    }
}

function getFontFamily() {
    return fontChoice.value === 'hind' ? "'Hind Siliguri', sans-serif" : "'Inter', sans-serif";
}

function updateFontPreview() {
    contentEditor.style.fontFamily = getFontFamily();
}

// ২. কন্টেন্ট এডিটর টুলস
function fmt(command, value = null) {
    document.execCommand(command, false, value);
    contentEditor.focus();
}

function insertMCQBlock() {
    const mcqHTML = `
        <div style="background: #f8f9fc; padding: 12px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #c9a84c;">
            <strong>📌 প্রশ্ন:</strong> _______________<br>
            <span style="display:inline-block; width:45%;">☐ ক) </span><span style="display:inline-block; width:45%;">☐ খ) </span><br>
            <span style="display:inline-block; width:45%;">☐ গ) </span><span style="display:inline-block; width:45%;">☐ ঘ) </span>
        </div><p></p>
    `;
    document.execCommand('insertHTML', false, mcqHTML);
}

// ৩. অটোমেটিক পেজ স্প্লিটিং অ্যালগরিদম (মূল সমাধান)
function splitIntoPages(contentHTML) {
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = 'width: 174mm; font-size: 11pt; line-height: 1.8; visibility: hidden; position: absolute; padding: 0;';
    tempDiv.innerHTML = contentHTML;
    document.body.appendChild(tempDiv);

    const nodes = Array.from(tempDiv.childNodes);
    const pages = [];
    let currentPageHTML = "";
    let currentHeight = 0;
    const maxHeight = 880; // A4 এর কন্টেন্ট এরিয়ার আনুমানিক পিক্সেল হাইট

    nodes.forEach(node => {
        let nodeHeight = 0;
        let nodeHTML = "";

        if (node.nodeType === 3) { // Text node
            if (node.textContent.trim() === "") return;
            nodeHTML = node.textContent;
            nodeHeight = 20; 
        } else {
            nodeHTML = node.outerHTML;
            nodeHeight = node.offsetHeight || 30;
        }

        if (currentHeight + nodeHeight > maxHeight) {
            pages.push(currentPageHTML);
            currentPageHTML = nodeHTML;
            currentHeight = nodeHeight;
        } else {
            currentPageHTML += nodeHTML;
            currentHeight += nodeHeight;
        }
    });

    if (currentPageHTML) pages.push(currentPageHTML);
    document.body.removeChild(tempDiv);
    return pages.length > 0 ? pages : [contentHTML];
}

// ৪. পেজ জেনারেটর (ওয়াটারমার্ক এবং সিগনেচার সহ)
function generateSinglePage(contentHTML, pageNum, totalPages) {
    const isFirstPage = pageNum === 1;
    const isLastPage = pageNum === totalPages;
    const watermark = showWatermark.checked ? (watermarkText.value || 'Mahmud Sir') : '';
    
    const signatureHTML = (showTeacherSignature.checked && isLastPage) ? `
        <div style="margin-top: 30px; text-align: right;">
            <div style="display: inline-block; text-align: left; background: #f8f9fc; padding: 10px 15px; border-radius: 8px; border-left: 4px solid #c9a84c;">
                <strong>✍️ ${document.getElementById('teacherFullName')?.value || teacherName.value}</strong><br>
                <small>${document.getElementById('teacherDesignation')?.value || 'Assistant Teacher'}</small>
            </div>
        </div>` : '';

    const pageNumHTML = showPageNum.checked ? `
        <div style="text-align: center; font-size: 9pt; color: #888; margin-top: 15px; border-top: 1px solid #eee; padding-top: 5px;">
            পৃষ্ঠা: ${pageNum} / ${totalPages}
        </div>` : '';

    return `
        <div class="sheet-page" style="width: 210mm; min-height: 297mm; background: white; margin: 15px auto; padding: 18mm; position: relative; box-shadow: 0 0 10px rgba(0,0,0,0.1); page-break-after: always; font-family: ${getFontFamily()};">
            
            ${watermark ? `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 70pt; font-weight: 900; color: rgba(15,31,69,0.06); pointer-events: none; z-index: 0; white-space: nowrap;">${watermark}</div>` : ''}

            <div style="position: relative; z-index: 1; border-bottom: 2px solid #0f1f45; padding-bottom: 8px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    <div style="font-size: 13pt; font-weight: 700; color: #0f1f45;">⚓ Bangladesh Navy School And College, CTG</div>
                    <div style="font-size: 8.5pt; color: #555;">${sheetClass.value} | ${sheetSubject.value}</div>
                </div>
                <div style="text-align: right; font-size: 8.5pt; color: #555;">
                    ${teacherName.value}<br>📞 ${teacherMobile.value}
                </div>
            </div>

            ${isFirstPage ? `
            <div style="background: #0f1f45; color: white; padding: 8px 12px; border-radius: 6px; margin-bottom: 20px; display: flex; justify-content: space-between;">
                <strong>📖 ${sheetTitle.value || 'Untitled Sheet'}</strong>
                <span style="background: #c9a84c; color: #0f1f45; padding: 0 10px; border-radius: 10px; font-size: 8pt; font-weight: bold;">${sheetType.options[sheetType.selectedIndex].text}</span>
            </div>` : ''}

            <div class="sheet-body" style="min-height: 200mm; position: relative; z-index: 1;">
                ${contentHTML}
            </div>

            <div style="position: relative; z-index: 1;">
                ${signatureHTML}
                ${pageNumHTML}
            </div>
        </div>
    `;
}

// ৫. প্রিভিউ এবং ডাউনলোড লজিক
function previewSheet() {
    const pages = splitIntoPages(contentEditor.innerHTML);
    let finalHTML = "";
    pages.forEach((html, i) => finalHTML += generateSinglePage(html, i + 1, pages.length));
    
    document.getElementById('previewContent').innerHTML = `<div style="background: #e0e4ef; padding: 20px 0;">${finalHTML}</div>`;
    document.getElementById('previewModal').classList.remove('hidden');
}

function downloadPDF() {
    const pages = splitIntoPages(contentEditor.innerHTML);
    let finalHTML = "";
    pages.forEach((html, i) => finalHTML += generateSinglePage(html, i + 1, pages.length));

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><head><title>Print Sheet</title><style>body{margin:0;background:#fff;} @media print{.sheet-page{box-shadow:none;margin:0;}}</style></head><body>${finalHTML}</body></html>`);
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
        closeModal('downloadModal');
    }, 500);
}

// ৬. ইনিশিয়ালাইজেশন এবং অটো-সেভ
function autoSave() {
    const data = {
        content: contentEditor.innerHTML,
        title: sheetTitle.value,
        subject: sheetSubject.value,
        class: sheetClass.value,
        teacher: teacherName.value,
        mobile: teacherMobile.value,
        whatsapp: teacherWhatsapp.value,
        watermark: watermarkText.value,
        showW: showWatermark.checked,
        showP: showPageNum.checked
    };
    localStorage.setItem('sheetData', JSON.stringify(data));
}

function loadData() {
    const saved = JSON.parse(localStorage.getItem('sheetData') || '{}');
    if (saved.content) {
        contentEditor.innerHTML = saved.content;
        sheetTitle.value = saved.title || "";
        sheetSubject.value = saved.subject || "ICT";
        sheetClass.value = saved.class || "";
        teacherName.value = saved.teacher || "Mahmud";
        teacherMobile.value = saved.mobile || "01883100648";
        watermarkText.value = saved.watermark || "Mahmud Sir";
        showWatermark.checked = saved.showW !== false;
        showPageNum.checked = saved.showP !== false;
    }
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

function openDownloadModal() {
    document.getElementById('downloadModal').classList.remove('hidden');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    addTeacherFields();
    loadData();
    updateFontPreview();
    
    [sheetTitle, sheetSubject, sheetClass, teacherName, teacherMobile, watermarkText].forEach(el => {
        el.addEventListener('input', autoSave);
    });
    contentEditor.addEventListener('input', autoSave);
    fontChoice.addEventListener('change', () => { updateFontPreview(); autoSave(); });
});
