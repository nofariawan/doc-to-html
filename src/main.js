import mammoth from "mammoth/mammoth.browser";
import "./style.css";

const app = document.querySelector("#app");

app.innerHTML = `
  <section class="shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="DocuHTML beranda">
        <span class="brand-mark">D</span>
        <span>DocuHTML</span>
      </a>
      <span class="privacy"><span class="privacy-dot"></span> Diproses lokal di browser</span>
    </header>

    <section class="hero">
      <span class="eyebrow">DOCX → HTML</span>
      <h1>TNC Doc to HTML Converter</em></h1>
      <p>Konversi heading, paragraf, tabel, daftar, tautan, dan gambar tanpa mengunggah dokumen Anda ke server.</p>
    </section>

    <section class="workspace">
      <div id="dropzone" class="dropzone" tabindex="0" role="button" aria-label="Pilih file DOCX">
        <input id="fileInput" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden />
        <div class="upload-icon" aria-hidden="true">⇧</div>
        <h2>Tarik file DOCX ke sini</h2>
        <p>atau klik untuk memilih dokumen</p>
        <button id="chooseButton" class="primary" type="button">Pilih File DOCX</button>
        <small>Maksimal 20 MB · Format .docx</small>
      </div>

      <div id="result" class="result hidden">
        <div class="filebar">
          <div>
            <span class="word-icon">W</span>
            <span class="file-details">
              <label for="outputFileName">Nama file output</label>
              <span class="file-name-field"><input id="outputFileName" type="text" aria-label="Nama file output" /><span>.html</span></span>
              <small id="fileSize"></small>
            </span>
          </div>
          <button id="resetButton" class="text-button" type="button">Ganti file</button>
        </div>

        <div id="messages" class="messages hidden"></div>

        <div class="result-grid">
          <section class="panel">
            <div class="panel-head"><h2>Preview</h2><span id="elementCount"></span></div>
            <article id="preview" class="preview"></article>
          </section>
          <section class="panel">
            <div class="panel-head"><h2>HTML</h2><button id="copyButton" class="mini-button" type="button">Salin HTML</button></div>
            <textarea id="htmlOutput" spellcheck="false" aria-label="Hasil HTML"></textarea>
          </section>
        </div>

        <div class="actions">
          <button id="downloadButton" class="primary" type="button">Unduh HTML</button>
          <button id="copyBottomButton" class="secondary" type="button">Salin ke clipboard</button>
        </div>
      </div>
    </section>

    <footer>Dokumen Anda tetap berada di perangkat Anda.</footer>
  </section>
`;

const $ = (selector) => document.querySelector(selector);
const dropzone = $("#dropzone");
const fileInput = $("#fileInput");
const result = $("#result");
const htmlOutput = $("#htmlOutput");
let currentFileName = "document";

const documentCss = `
  :root { color: #111; background: #ececec; font-family: Arial, Helvetica, sans-serif; }
  * { box-sizing: border-box; }
  body { width: min(210mm, calc(100% - 32px)); min-height: 297mm; margin: 24px auto; padding: 22mm 20mm; background: #fff; box-shadow: 0 2px 18px rgba(0,0,0,.14); font-size: 11pt; line-height: 1.35; }
  h1, h2, h3, h4, h5, h6 { margin: 1em 0 .45em; line-height: 1.2; page-break-after: avoid; }
  h1 { font-size: 18pt; } h2 { font-size: 15pt; } h3 { font-size: 12pt; }
  p { margin: 0 0 .65em; }
  .document-title { margin-bottom: .2em; text-align: center; font-size: 16pt; }
  .document-subtitle { margin-top: 0; text-align: center; font-weight: 700; }
  .center, .centered, .docx-center { text-align: center; }
  .docx-justify { text-align: justify; text-align-last: left; }
  p.docx-center { margin: 0; line-height: 1.15; }
  p.docx-center + p.docx-center { margin-top: .08em; }
  p.docx-center + ol { margin-top: 1.25em; }
  ol, ul { margin: .35em 0 .8em; padding-left: 2em; }
  ol.has-continuation { margin-bottom: .18em; }
  li { margin: .25em 0; padding-left: .2em; }
  li > p { margin: 0; }
  ol li > ul { list-style-type: circle; }
  .list-continuation-main { margin-left: 2em; }
  .list-continuation-sub { margin-left: 4em; }
  table.list-continuation-main { width: calc(100% - 2em); }
  table.list-continuation-sub { width: calc(100% - 4em); }
  ol.list-continuation-sub { margin-left: 2em; }
  table { width: 100%; margin: .85em 0 1.1em; border-collapse: collapse; page-break-inside: avoid; }
  th, td { padding: 6px 8px; border: 1px solid #222; vertical-align: top; }
  th { padding: 5px 8px; background: #d00000; color: #fff; text-align: center; vertical-align: middle; font-weight: 700; line-height: 1.12; }
  table tr:first-child td { font-weight: 700; text-align: center; }
  td p, th p { margin: 0; }
  img { max-width: 100%; height: auto; }
  a { color: #0645ad; overflow-wrap: anywhere; }
  blockquote { margin: .8em 1.5em; padding-left: 1em; border-left: 3px solid #aaa; color: #444; }
  .document-header { margin: -8mm 0 10mm; padding: 10px 0 24px; border-bottom: 1px solid #e5e5e5; }
  .hsbc-logo { display: block; width: 116px; height: auto; }
  .document-footer { margin-top: 14mm; padding: 0; color: #242424; font-size: 10pt; line-height: 1.45; text-align: left; }
  .regulatory-text { margin: 0 0 18px; font-size: 9pt; }
  .hsbc-divider { display: block; width: 100%; height: 2px; margin: 0 0 18px; }
  .footer-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
  .footer-heading { display: block; margin-bottom: 7px; font-size: 13pt; font-weight: 400; }
  .social-icons { display: flex; gap: 10px; align-items: center; }
  .social-icon { display: inline-grid; place-items: center; width: 23px; height: 23px; color: #242424; }
  .social-icon svg { display: block; width: 100%; height: 100%; fill: currentColor; }
  .contact-block { text-align: right; }
  @media (max-width: 700px) { body { width: 100%; min-height: 0; margin: 0; padding: 24px 18px; box-shadow: none; } .document-header { margin-top: 0; padding-top: 18px; padding-bottom: 24px; } .footer-columns { grid-template-columns: 1fr; } .contact-block { text-align: left; } }
  @media print { :root { background: #fff; } body { width: auto; min-height: 0; margin: 0; padding: 0; box-shadow: none; } @page { size: A4; margin: 20mm; } }
`;

const documentHeaderHtml = `
  <header class="document-header">
    <svg class="hsbc-logo" viewBox="0 0 145 38" role="img" aria-label="HSBC" xmlns="http://www.w3.org/2000/svg">
      <g fill="#000"><path d="M94.3 20.1h-6.7v6.6h-3.4V11.2h3.4v6.3h6.7v-6.3h3.4v15.5h-3.4z"/><path d="M105.8 27c-3.3 0-6.1-1.3-6.2-5h3.4c0 1.7 1 2.6 2.9 2.6 1.4 0 2.9-.7 2.9-2.2 0-1.2-1.1-1.6-2.8-2.1l-1.1-.3c-2.4-.7-4.9-1.7-4.9-4.4 0-3.5 3.2-4.6 6.2-4.6 3 0 5.6 1.1 5.6 4.5h-3.4c-.1-1.4-.9-2.2-2.5-2.2-1.2 0-2.5.7-2.5 2 0 1.1 1 1.5 3.2 2.2l1.3.4c2.7.8 4.3 1.8 4.3 4.3 0 3.5-3.4 4.8-6.4 4.8z"/><path d="M114.1 11.2h5.4c1.7 0 2.4 0 3 .2 1.9.4 3.3 1.7 3.3 3.7s-1.3 3-3.1 3.5c2.1.4 3.6 1.5 3.6 3.8 0 3.5-3.5 4.3-6.2 4.3h-6zm5.4 6.5c1.5 0 3-.3 3-2.1 0-1.6-1.4-2-2.8-2h-2.4v4.1zm.4 6.7c1.6 0 3.1-.4 3.1-2.3 0-1.8-1.3-2.3-2.9-2.3h-2.7v4.5z"/><path d="M135.2 27c-5 0-7.3-3.2-7.3-7.9s2.5-8.2 7.4-8.2c3.1 0 6.1 1.4 6.2 4.9H138c-.2-1.5-1.2-2.4-2.7-2.4-3 0-3.9 3.3-3.9 5.7 0 2.5.9 5.3 3.8 5.3 1.5 0 2.6-.8 2.9-2.4h3.5c-.4 3.7-3.2 5-6.4 5z"/></g>
      <g fill="#db0011"><path d="m59.6 37.5 18.5-18.5L59.6.5zM22.5 37.5 4 19 22.5.5zM59.6.5 41 19 22.5.5zM22.5 37.5 41 19l18.6 18.5z"/></g>
    </svg>
  </header>`;

const documentFooterHtml = `
  <footer class="document-footer">
    <p class="regulatory-text">PT Bank HSBC Indonesia berizin dan diawasi oleh Otoritas Jasa Keuangan (OJK) dan Bank Indonesia (BI).</p>
    <svg class="hsbc-divider" viewBox="0 0 600 2" preserveAspectRatio="none" role="img" aria-label="divider image"><path fill="#db0011" d="M0 0h600v2H0z"/></svg>
    <div class="footer-columns">
      <div><span class="footer-heading">Ikuti kami</span><div class="social-icons">
        <span class="social-icon" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M14 8h3V4h-3c-3 0-5 2-5 5v2H6v4h3v7h4v-7h3l1-4h-4V9c0-1 0-1 1-1z"/></svg></span>
        <span class="social-icon" aria-label="Twitter"><svg viewBox="0 0 24 24"><path d="M18.5 3h3.7l-8.1 9.2L23.6 21h-7.4l-5.8-7.6L3.7 21H0l8.7-9.9L-.4 3h7.6l5.2 6.9zm-1.3 16h2L6.1 4.9H4z"/></svg></span>
        <span class="social-icon" aria-label="Instagram"><svg viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm11 1.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg></span>
      </div></div>
      <div class="contact-block"><span class="footer-heading">Hubungi kami</span><div>1 500 700 (Premier)<br>1 500 808 (Non Premier)</div></div>
    </div>
  </footer>`;

function wrapWithDocumentTemplate(content) {
  return `${documentHeaderHtml}<main class="document-content">${content}</main>${documentFooterHtml}`;
}

const styleMap = [
  "p[style-name='DocuHTML Justified']:ordered-list(1) => ol > li.docx-justify:fresh",
  "p[style-name='DocuHTML Justified']:ordered-list(2) => ul|ol > li.docx-justify > ol > li.docx-justify:fresh",
  "p[style-name='DocuHTML Justified']:ordered-list(3) => ul|ol > li.docx-justify > ul|ol > li.docx-justify > ol > li.docx-justify:fresh",
  "p[style-name='DocuHTML Justified']:unordered-list(1) => ul > li.docx-justify:fresh",
  "p[style-name='DocuHTML Justified']:unordered-list(2) => ul|ol > li.docx-justify > ul > li.docx-justify:fresh",
  "p[style-name='DocuHTML Justified']:unordered-list(3) => ul|ol > li.docx-justify > ul|ol > li.docx-justify > ul > li.docx-justify:fresh",
  "p[style-name='Title'] => h1.document-title:fresh",
  "p[style-name='Judul'] => h1.document-title:fresh",
  "p[style-name='Subtitle'] => p.document-subtitle:fresh",
  "p[style-name='Subjudul'] => p.document-subtitle:fresh",
  "p[style-name='Centered'] => p.centered:fresh",
  "p[style-name='Center'] => p.center:fresh",
  "p[style-name='DocuHTML Centered'] => p.docx-center:fresh",
  "p[style-name='DocuHTML Justified'] => p.docx-justify:fresh"
];

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function normalizeFileNameCharacters(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 100);
}

function sanitizeFileName(value) {
  let sanitized = normalizeFileNameCharacters(value.replace(/\.html$/i, ""))
    .replace(/^_+|_+$/g, "");

  if (/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(sanitized)) {
    sanitized = `${sanitized}_file`;
  }

  return sanitized || "document";
}

function correctWordNumberingLevels(documentNode) {
  let hasExplicitMainParent = false;

  function visit(node) {
    if (node.type === "paragraph" && node.numbering) {
      const rawIndent = node.indent?.start;
      const indent = Number.parseInt(rawIndent, 10) || 0;
      const level = Number.parseInt(node.numbering.level, 10) || 0;

      // Some Word templates create alphabetic sublists as a separate numId
      // at level 0 and express hierarchy through indent, or omit the direct
      // indent because it lives only in the numbering definition.
      if (level === 0 && (indent >= 400 || (rawIndent == null && hasExplicitMainParent))) {
        node.numbering.level = "1";
      }

      if (level === 0 && indent === 0 && rawIndent != null) {
        hasExplicitMainParent = true;
      }
    } else if (node.type === "paragraph" && node.children?.length) {
      hasExplicitMainParent = false;
    }
    if (node.type === "paragraph" && !node.numbering && node.alignment === "center") {
      node.styleName = "DocuHTML Centered";
    }
    if (node.type === "paragraph" && ["both", "justify"].includes(node.alignment)) {
      const isSemanticHeading = /^(Title|Subtitle|Heading|Judul|Subjudul)/i.test(node.styleName || "");
      if (!isSemanticHeading) {
        node.styleName = "DocuHTML Justified";
      }
    }
    node.children?.forEach(visit);
    return node;
  }

  return visit(documentNode);
}

function normalizeNumbering(html) {
  const container = document.createElement("div");
  container.innerHTML = html.replaceAll("\u2013", "-");

  // Mammoth emits every Word table cell as <td>. Promote an all-bold first
  // row to semantic headers so its styling survives preview and download.
  container.querySelectorAll("table").forEach((table) => {
    const firstRow = table.rows[0];
    const cells = firstRow ? [...firstRow.cells] : [];
    if (cells.length && cells.every((cell) => cell.querySelector("strong"))) {
      cells.forEach((cell) => {
        const header = document.createElement("th");
        [...cell.attributes].forEach((attribute) => header.setAttribute(attribute.name, attribute.value));
        header.innerHTML = cell.innerHTML;
        cell.replaceWith(header);
      });
    }
  });

  // Mammoth sometimes wraps an alphabetic continuation after a table as
  // ul > li > ol. Flatten that artifact while retaining the expected "b".
  container.querySelectorAll(":scope > ul").forEach((list) => {
    const onlyItem = list.children.length === 1 ? list.firstElementChild : null;
    const nestedList = onlyItem?.children.length === 1 && onlyItem.firstElementChild?.tagName === "OL"
      ? onlyItem.firstElementChild
      : null;
    if (nestedList) {
      nestedList.type = "a";
      nestedList.start = 2;
      nestedList.dataset.listLevel = "2";
      list.replaceWith(nestedList);
    }
  });

  // Word may split a bullet belonging to an alphabetic item into a sibling
  // list. Attach it to the preceding alphabetic <li> so indentation and
  // hierarchy match the DOCX (for example, the bullet under point 5.b).
  container.querySelectorAll("li").forEach((item) => {
    let previousOrderedList = null;
    [...item.children].forEach((child) => {
      if (child.tagName === "OL") {
        previousOrderedList = child;
      } else if (child.tagName === "UL" && previousOrderedList?.lastElementChild) {
        previousOrderedList.lastElementChild.append(child);
      }
    });
  });

  let nextTopLevelNumber = 1;
  container.querySelectorAll(":scope > ol:not([data-list-level])").forEach((list) => {
    list.start = nextTopLevelNumber;
    nextTopLevelNumber += list.querySelectorAll(":scope > li").length;
  });

  function continueNestedLists(parent, depth = 1) {
    let nextNumber = 1;
    [...parent.children].forEach((child) => {
      if (child.tagName === "OL") {
        child.type = depth === 1 ? "a" : "i";
        child.start = nextNumber;
        nextNumber += child.querySelectorAll(":scope > li").length;
      }
    });

    parent.querySelectorAll(":scope > ol > li").forEach((item) => continueNestedLists(item, depth + 1));
  }

  container.querySelectorAll(":scope > ol > li").forEach((item) => continueNestedLists(item));

  const mainLists = [...container.querySelectorAll(":scope > ol:not([data-list-level])")];
  mainLists.forEach((list) => {
    const lastItem = list.querySelector(":scope > li:last-child");
    const continuationClass = lastItem?.querySelector(":scope > ol, :scope > ul")
      ? "list-continuation-sub"
      : "list-continuation-main";

    let sibling = list.nextElementSibling;
    let hasContinuation = false;
    while (sibling && !mainLists.includes(sibling)) {
      if (sibling.matches("p, table, ol[data-list-level]")) {
        sibling.classList.add(continuationClass);
        hasContinuation = true;
      }
      sibling = sibling.nextElementSibling;
    }
    list.classList.toggle("has-continuation", hasContinuation);
  });
  return container.innerHTML;
}

function setBusy(busy) {
  dropzone.classList.toggle("busy", busy);
  $("#chooseButton").textContent = busy ? "Mengonversi…" : "Pilih File DOCX";
}

function formatBytes(bytes) {
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function convertFile(file) {
  if (!file || !file.name.toLowerCase().endsWith(".docx")) {
    alert("Silakan pilih file dengan format .docx.");
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    alert("Ukuran file melebihi batas 20 MB.");
    return;
  }

  setBusy(true);
  try {
    const arrayBuffer = await file.arrayBuffer();
    const conversion = await mammoth.convertToHtml({ arrayBuffer }, {
      includeDefaultStyleMap: true,
      styleMap,
      transformDocument: correctWordNumberingLevels,
      convertImage: mammoth.images.imgElement((image) => image.read("base64").then((data) => ({
        src: `data:${image.contentType};base64,${data}`
      })))
    });

    const normalizedHtml = normalizeNumbering(conversion.value);
    currentFileName = sanitizeFileName(file.name.replace(/\.docx$/i, ""));
    $("#outputFileName").value = currentFileName;
    $("#fileSize").textContent = formatBytes(file.size);
    $("#preview").innerHTML = wrapWithDocumentTemplate(normalizedHtml || "<p>Dokumen tidak memiliki konten yang dapat dikonversi.</p>");
    htmlOutput.value = normalizedHtml;
    const count = $("#preview").querySelectorAll("*").length;
    $("#elementCount").textContent = `${count} elemen`;

    const messages = $("#messages");
    if (conversion.messages.length) {
      messages.textContent = `${conversion.messages.length} catatan konversi — beberapa format Word mungkin disederhanakan.`;
      messages.classList.remove("hidden");
    } else {
      messages.classList.add("hidden");
    }

    dropzone.classList.add("hidden");
    result.classList.remove("hidden");
  } catch (error) {
    console.error(error);
    alert("Dokumen tidak dapat dikonversi. Pastikan file DOCX tidak rusak atau dilindungi kata sandi.");
  } finally {
    setBusy(false);
  }
}

async function copyHtml(button) {
  await navigator.clipboard.writeText(buildFullDocument());
  const oldText = button.textContent;
  button.textContent = "Tersalin ✓";
  setTimeout(() => { button.textContent = oldText; }, 1600);
}

function buildFullDocument() {
  const safeTitle = escapeHtml(currentFileName);
  return `<!doctype html>\n<html lang="id">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${safeTitle}</title>\n<style>${documentCss}</style>\n</head>\n<body>\n${wrapWithDocumentTemplate(htmlOutput.value)}\n</body>\n</html>`;
}

function downloadHtml() {
  const fullDocument = buildFullDocument();
  const url = URL.createObjectURL(new Blob([fullDocument], { type: "text/html;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${currentFileName}.html`;
  anchor.click();
  URL.revokeObjectURL(url);
}

$("#chooseButton").addEventListener("click", (event) => { event.stopPropagation(); fileInput.click(); });
dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("keydown", (event) => { if (["Enter", " "].includes(event.key)) fileInput.click(); });
fileInput.addEventListener("change", () => convertFile(fileInput.files[0]));
["dragenter", "dragover"].forEach((name) => dropzone.addEventListener(name, (event) => { event.preventDefault(); dropzone.classList.add("dragging"); }));
["dragleave", "drop"].forEach((name) => dropzone.addEventListener(name, (event) => { event.preventDefault(); dropzone.classList.remove("dragging"); }));
dropzone.addEventListener("drop", (event) => convertFile(event.dataTransfer.files[0]));
$("#resetButton").addEventListener("click", () => { result.classList.add("hidden"); dropzone.classList.remove("hidden"); fileInput.value = ""; });
$("#copyButton").addEventListener("click", (event) => copyHtml(event.currentTarget));
$("#copyBottomButton").addEventListener("click", (event) => copyHtml(event.currentTarget));
$("#downloadButton").addEventListener("click", downloadHtml);
$("#outputFileName").addEventListener("input", (event) => {
  const normalized = normalizeFileNameCharacters(event.currentTarget.value);
  event.currentTarget.value = normalized;
  currentFileName = normalized || "document";
});
$("#outputFileName").addEventListener("blur", (event) => {
  currentFileName = sanitizeFileName(event.currentTarget.value);
  event.currentTarget.value = currentFileName;
});
htmlOutput.addEventListener("input", () => { $("#preview").innerHTML = wrapWithDocumentTemplate(htmlOutput.value); });
