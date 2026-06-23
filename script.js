let state = {
  personal: {
    name: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
  },
  summary: "",
  experience: [], // {id, role, company, from, to, desc}
  education: [], // {id, degree, school, year, gpa, percentage}
  projects: [], // {id, name, tech, link, desc}
  certificates: [], // {id, name, issuer, date, link}
  skills: [], // {id, category, values:[]}
};
let expCtr = 0,
  eduCtr = 0,
  projCtr = 0,
  certCtr = 0,
  sgCtr = 0;

const STORE_KEY = "buildresume_v6";

function save() {
  gatherPersonal();
  state.summary = document.getElementById("s-text").value;
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
  updateBadges();
}

function load() {
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) return;
  try {
    state = JSON.parse(raw);
    const p = state.personal || {};
    sv("p-name", p.name);
    sv("p-email", p.email);
    sv("p-phone", p.phone);
    sv("p-location", p.location);
    sv("p-website", p.website);
    sv("p-linkedin", p.linkedin);
    sv("s-text", state.summary);

    (state.experience || []).forEach((e) => renderExpCard(e));
    if (state.experience.length)
      expCtr = Math.max(...state.experience.map((e) => e.id));

    (state.education || []).forEach((e) => renderEduCard(e));
    if (state.education.length)
      eduCtr = Math.max(...state.education.map((e) => e.id));

    (state.projects || []).forEach((p) => renderProjCard(p));
    if ((state.projects || []).length)
      projCtr = Math.max(...state.projects.map((p) => p.id));

    (state.certificates || []).forEach((c) => renderCertCard(c));
    if ((state.certificates || []).length)
      certCtr = Math.max(...state.certificates.map((c) => c.id));

    (state.skills || []).forEach((g) => renderSGCard(g));
    if (state.skills.length) sgCtr = Math.max(...state.skills.map((g) => g.id));

    updateBadges();
    renderResume();
    renumberAll();
  } catch (e) {
    console.error("Load error", e);
  }
}

function sv(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || "";
}

function gatherPersonal() {
  state.personal = {
    name: g("p-name"),
    email: g("p-email"),
    phone: g("p-phone"),
    location: g("p-location"),
    website: g("p-website"),
    linkedin: g("p-linkedin"),
  };
}
function g(id) {
  return (document.getElementById(id) || {}).value?.trim() || "";
}


function switchTab(tab, el) {
  document
    .querySelectorAll(".tab-section")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelectorAll(".sidebar .nav-item")
    .forEach((n) => n.classList.remove("active"));
  document.getElementById("tab-" + tab).classList.add("active");
  if (el) el.classList.add("active");
}

function setView(view) {
  const ep = document.getElementById("editor-panel");
  const pp = document.getElementById("preview-panel");
  document
    .getElementById("vtab-edit")
    .classList.toggle("active", view === "edit");
  document
    .getElementById("vtab-preview")
    .classList.toggle("active", view === "preview");
  ep.classList.toggle("v-hidden", view !== "edit");
  pp.classList.toggle("v-hidden", view !== "preview");
}

function mobileTab(tab, el) {
  setView("edit");
  document
    .querySelectorAll(".tab-section")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById("tab-" + tab).classList.add("active");
  document
    .querySelectorAll(".bnav-btn")
    .forEach((b) => b.classList.remove("active"));
  el.classList.add("active");
}


function renumberSection(items, idPrefix, label) {
  items.forEach((item, idx) => {
    const card = document.getElementById(idPrefix + item.id);
    if (!card) return;
    const numEl = card.querySelector(".card-num");
    if (numEl) numEl.textContent = `${label} #${idx + 1}`;
  });
}
function renumberAll() {
  renumberSection(state.experience, "ec-", "EXP");
  renumberSection(state.education, "ec2-", "EDU");
  renumberSection(state.projects || [], "pc-", "PROJECT");
  renumberSection(state.certificates || [], "cc-", "CERT");
}


function addExp(data) {
  const id = ++expCtr;
  const exp = data || { id, role: "", company: "", from: "", to: "", desc: "" };
  if (!data) {
    state.experience.push(exp);
    save();
  }
  renderExpCard(exp);
  renumberAll();
}

function renderExpCard(exp) {
  const el = document.createElement("div");
  el.className = "card";
  el.id = "ec-" + exp.id;
  el.innerHTML = `
    <div class="card-header">
      <span class="card-num">EXP #${exp.id}</span>
      <button class="btn-remove" onclick="removeExp(${exp.id})">✕ Remove</button>
    </div>
    <div class="field-group"><label>Job Title</label>
      <input type="text" placeholder="e.g. Software Engineer" value="${x(exp.role)}"
        oninput="upExp(${exp.id},'role',this.value)"></div>
    <div class="field-group"><label>Company</label>
      <input type="text" placeholder="e.g. Google" value="${x(exp.company)}"
        oninput="upExp(${exp.id},'company',this.value)"></div>
    <div class="field-row">
      <div class="field-group"><label>Start Date</label>
        <input type="text" placeholder="Jan 2021" value="${x(exp.from)}"
          oninput="upExp(${exp.id},'from',this.value)"></div>
      <div class="field-group"><label>End Date</label>
        <input type="text" placeholder="Present" value="${x(exp.to)}"
          oninput="upExp(${exp.id},'to',this.value)"></div>
    </div>
    <div class="field-group"><label>Description</label>
      <textarea rows="4" placeholder="• Developed...\n• Led a team of..."
        oninput="upExp(${exp.id},'desc',this.value)">${x(exp.desc)}</textarea></div>
  `;
  document.getElementById("exp-list").appendChild(el);
}

function upExp(id, field, val) {
  const e = state.experience.find((e) => e.id === id);
  if (e) {
    e[field] = val;
    save();
    renderResume();
  }
}
function removeExp(id) {
  state.experience = state.experience.filter((e) => e.id !== id);
  document.getElementById("ec-" + id)?.remove();
  save();
  renderResume();
  renumberAll();
}


function addEdu(data) {
  const id = ++eduCtr;
  const edu = data || {
    id,
    degree: "",
    school: "",
    year: "",
    gpa: "",
    percentage: "",
  };
  if (!data) {
    state.education.push(edu);
    save();
  }
  renderEduCard(edu);
  renumberAll();
}

function renderEduCard(edu) {
  const el = document.createElement("div");
  el.className = "card";
  el.id = "ec2-" + edu.id;
  el.innerHTML = `
    <div class="card-header">
      <span class="card-num">EDU #${edu.id}</span>
      <button class="btn-remove" onclick="removeEdu(${edu.id})">✕ Remove</button>
    </div>
    <div class="field-group"><label>Degree / Qualification</label>
      <input type="text" placeholder="e.g. MCA - Computer Science" value="${x(edu.degree)}"
        oninput="upEdu(${edu.id},'degree',this.value)"></div>
    <div class="field-group"><label>College / University</label>
      <input type="text" placeholder="e.g. AMC" value="${x(edu.school)}"
        oninput="upEdu(${edu.id},'school',this.value)"></div>
    <div class="field-group"><label>Graduation Year</label>
      <input type="text" placeholder="2023" value="${x(edu.year)}"
        oninput="upEdu(${edu.id},'year',this.value)"></div>
    <div class="field-row">
      <div class="field-group"><label>GPA (Optional)</label>
        <input type="text" placeholder="8.4 / 10" value="${x(edu.gpa)}"
          oninput="upEdu(${edu.id},'gpa',this.value)"></div>
      <div class="field-group"><label>Percentage (Optional)</label>
        <input type="text" placeholder="85%" value="${x(edu.percentage)}"
          oninput="upEdu(${edu.id},'percentage',this.value)"></div>
    </div>
  `;
  document.getElementById("edu-list").appendChild(el);
}

function upEdu(id, field, val) {
  const e = state.education.find((e) => e.id === id);
  if (e) {
    e[field] = val;
    save();
    renderResume();
  }
}
function removeEdu(id) {
  state.education = state.education.filter((e) => e.id !== id);
  document.getElementById("ec2-" + id)?.remove();
  save();
  renderResume();
  renumberAll();
}


function addProj(data) {
  const id = ++projCtr;
  const proj = data || { id, name: "", tech: "", link: "", desc: "" };
  if (!data) {
    state.projects.push(proj);
    save();
  }
  renderProjCard(proj);
  updateBadges();
  renumberAll();
}

function renderProjCard(proj) {
  const el = document.createElement("div");
  el.className = "card";
  el.id = "pc-" + proj.id;
  el.innerHTML = `
    <div class="card-header">
      <span class="card-num">PROJECT #${proj.id}</span>
      <button class="btn-remove" onclick="removeProj(${proj.id})">✕ Remove</button>
    </div>
    <div class="field-group"><label>Project Name</label>
      <input type="text" placeholder="e.g. E-Commerce Platform" value="${x(proj.name)}"
        oninput="upProj(${proj.id},'name',this.value)"></div>
    <div class="field-group"><label>Technologies Used</label>
      <input type="text" placeholder="e.g. React, Node.js, MongoDB" value="${x(proj.tech)}"
        oninput="upProj(${proj.id},'tech',this.value)"></div>
    <div class="field-group"><label>Project Link (Optional)</label>
      <input type="url" placeholder="https://github.com/you/project" value="${x(proj.link)}"
        oninput="upProj(${proj.id},'link',this.value)"></div>
    <div class="field-group"><label>Description</label>
      <textarea rows="4" placeholder="• Built a full-stack app that...\n• Improved performance by 40%..."
        oninput="upProj(${proj.id},'desc',this.value)">${x(proj.desc)}</textarea></div>
  `;
  document.getElementById("proj-list").appendChild(el);
}

function upProj(id, field, val) {
  const p = state.projects.find((p) => p.id === id);
  if (p) {
    p[field] = val;
    save();
    renderResume();
  }
}
function removeProj(id) {
  state.projects = state.projects.filter((p) => p.id !== id);
  document.getElementById("pc-" + id)?.remove();
  save();
  renderResume();
  updateBadges();
  renumberAll();
}


function addCert(data) {
  const id = ++certCtr;
  const cert = data || { id, name: "", issuer: "", date: "", link: "" };
  if (!data) {
    state.certificates.push(cert);
    save();
  }
  renderCertCard(cert);
  updateBadges();
  renumberAll();
}

function renderCertCard(cert) {
  const el = document.createElement("div");
  el.className = "card";
  el.id = "cc-" + cert.id;
  el.innerHTML = `
    <div class="card-header">
      <span class="card-num">CERT #${cert.id}</span>
      <button class="btn-remove" onclick="removeCert(${cert.id})">✕ Remove</button>
    </div>
    <div class="field-group"><label>Certificate Name</label>
      <input type="text" placeholder="e.g. AWS Certified Solutions Architect" value="${x(cert.name)}"
        oninput="upCert(${cert.id},'name',this.value)"></div>
    <div class="field-group"><label>Issuing Organization</label>
      <input type="text" placeholder="e.g. Amazon Web Services" value="${x(cert.issuer)}"
        oninput="upCert(${cert.id},'issuer',this.value)"></div>
    <div class="field-row">
      <div class="field-group"><label>Date Earned</label>
        <input type="text" placeholder="e.g. Mar 2024" value="${x(cert.date)}"
          oninput="upCert(${cert.id},'date',this.value)"></div>
      <div class="field-group"><label>Credential Link (Optional)</label>
        <input type="url" placeholder="https://..." value="${x(cert.link)}"
          oninput="upCert(${cert.id},'link',this.value)"></div>
    </div>
  `;
  document.getElementById("cert-list").appendChild(el);
}

function upCert(id, field, val) {
  const c = state.certificates.find((c) => c.id === id);
  if (c) {
    c[field] = val;
    save();
    renderResume();
  }
}
function removeCert(id) {
  state.certificates = state.certificates.filter((c) => c.id !== id);
  document.getElementById("cc-" + id)?.remove();
  save();
  renderResume();
  updateBadges();
  renumberAll();
}


function addSG(data) {
  const id = ++sgCtr;
  const sg = data || { id, category: "", values: [] };
  if (!data) {
    state.skills.push(sg);
    save();
  }
  renderSGCard(sg);
  updateBadges();
}

function renderSGCard(sg) {
  const el = document.createElement("div");
  el.className = "sg-card";
  el.id = "sg-" + sg.id;
  el.innerHTML = `
    <div class="sg-header">
      <input class="sg-cat-input" type="text"
        placeholder="Category (e.g. Languages)"
        value="${x(sg.category)}"
        oninput="upSGCat(${sg.id}, this.value)">
      <button class="btn-remove" onclick="removeSG(${sg.id})">✕</button>
    </div>
    <div class="sg-chips" id="sgc-${sg.id}"></div>
    <div class="sg-add-row">
      <input type="text" id="sgi-${sg.id}"
        placeholder="Type skill (e.g. Java) — comma-separated"
        onkeydown="if(event.key==='Enter'){event.preventDefault();addSGVal(${sg.id})}">
      <button class="btn-chip-add" onclick="addSGVal(${sg.id})" title="Add">+</button>
    </div>
  `;
  document.getElementById("sg-list").appendChild(el);
  (sg.values || []).forEach((v) => addChip(sg.id, v));
}

function addChip(sgId, val) {
  const area = document.getElementById("sgc-" + sgId);
  if (!area) return;
  const chip = document.createElement("span");
  chip.className = "sg-chip";
  chip.dataset.v = val;
  chip.innerHTML = `${x(val)}<button type="button" onclick="removeSGVal(${sgId},this.parentElement.dataset.v)" title="Remove">×</button>`;
  area.appendChild(chip);
}

function upSGCat(id, val) {
  const sg = state.skills.find((g) => g.id === id);
  if (sg) {
    sg.category = val;
    save();
    renderResume();
  }
}

function addSGVal(sgId) {
  const input = document.getElementById("sgi-" + sgId);
  if (!input) return;
  const raw = input.value.trim();
  if (!raw) return;
  const sg = state.skills.find((g) => g.id === sgId);
  if (!sg) return;
  raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((v) => {
      if (!sg.values.includes(v)) {
        sg.values.push(v);
        addChip(sgId, v);
      }
    });
  input.value = "";
  save();
  renderResume();
  updateBadges();
}

function removeSGVal(sgId, val) {
  const sg = state.skills.find((g) => g.id === sgId);
  if (!sg) return;
  sg.values = sg.values.filter((v) => v !== val);
  const area = document.getElementById("sgc-" + sgId);
  if (area) {
    area.innerHTML = "";
    sg.values.forEach((v) => addChip(sgId, v));
  }
  save();
  renderResume();
  updateBadges();
}

function removeSG(id) {
  state.skills = state.skills.filter((g) => g.id !== id);
  document.getElementById("sg-" + id)?.remove();
  save();
  renderResume();
  updateBadges();
}


function updateBadges() {
  const ec = state.experience.length;
  const dc = state.education.length;
  const pc = (state.projects || []).length;
  const cc = (state.certificates || []).length;
  const sc = state.skills.length;

  document.getElementById("exp-badge").textContent = ec;
  document.getElementById("edu-badge").textContent = dc;
  document.getElementById("proj-badge").textContent = pc;
  document.getElementById("cert-badge").textContent = cc;
  document.getElementById("skills-badge").textContent = sc;

  setBnBadge("bn-badge-exp", ec);
  setBnBadge("bn-badge-edu", dc);
  setBnBadge("bn-badge-proj", pc);
  setBnBadge("bn-badge-cert", cc);
  setBnBadge("bn-badge-sk", sc);
}
function setBnBadge(id, n) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = n;
  el.style.display = n > 0 ? "block" : "none";
}


function renderResume() {
  const p = state.personal;

  document.getElementById("r-name").textContent = p.name || "Your Name";

  const cont = document.getElementById("r-contacts");
  cont.innerHTML = "";
  [
    { v: p.email, icon: ico("mail"), href: `mailto:${p.email}` },
    { v: p.phone, icon: ico("phone"), href: null },
    { v: p.location, icon: ico("loc"), href: null },
    {
      v: p.website,
      icon: ico("web"),
      href: p.website,
      lbl: cleanUrl(p.website),
    },
    {
      v: p.linkedin,
      icon: ico("li"),
      href: p.linkedin,
      lbl: cleanUrl(p.linkedin),
    },
  ].forEach((c) => {
    if (!c.v) return;
    const s = document.createElement("span");
    s.className = "r-contact-item";
    const lbl = c.lbl || c.v;
    s.innerHTML =
      c.icon +
      (c.href
        ? `<a href="${x(c.href)}" target="_blank">${x(lbl)}</a>`
        : `<span>${x(lbl)}</span>`);
    cont.appendChild(s);
  });

  const sumSec = document.getElementById("r-sum-sec");
  const sumEl = document.getElementById("r-sum");
  if (state.summary) {
    sumEl.textContent = state.summary;
    sumSec.style.display = "";
  } else sumSec.style.display = "none";

  const expSec = document.getElementById("r-exp-sec");
  const expList = document.getElementById("r-exp-list");
  expList.innerHTML = "";
  if (state.experience.length) {
    expSec.style.display = "";
    state.experience.forEach((e) => {
      const d = document.createElement("div");
      d.className = "r-exp-item";
      const dates = [e.from, e.to].filter(Boolean).join(" – ");
      d.innerHTML = `
        <div class="r-exp-header">
          <div class="r-exp-role">${x(e.role) || '<em style="color:#bfc5d8">Job Title</em>'}</div>
          ${dates ? `<div class="r-exp-dates">${x(dates)}</div>` : ""}
        </div>
        ${e.company ? `<div class="r-exp-company">${x(e.company)}</div>` : ""}
        ${e.desc ? `<div class="r-exp-desc">${x(e.desc)}</div>` : ""}
      `;
      expList.appendChild(d);
    });
  } else expSec.style.display = "none";

  const eduSec = document.getElementById("r-edu-sec");
  const eduList = document.getElementById("r-edu-list");
  eduList.innerHTML = "";
  if (state.education.length) {
    eduSec.style.display = "";
    state.education.forEach((e) => {
      const d = document.createElement("div");
      d.className = "r-edu-item";
      d.innerHTML = `
        <div class="r-edu-header">
          <div class="r-edu-degree">${x(e.degree) || '<em style="color:#bfc5d8">Degree</em>'}</div>
          ${e.year ? `<div class="r-edu-year">${x(e.year)}</div>` : ""}
        </div>
        ${e.school ? `<div class="r-edu-school">${x(e.school)}</div>` : ""}
        ${e.gpa || e.percentage ? `<div class="r-edu-gpa">${[e.gpa ? `GPA: ${x(e.gpa)}` : "", e.percentage ? `Percentage: ${x(e.percentage)}` : ""].filter(Boolean).join("  •  ")}</div>` : ""}
      `;
      eduList.appendChild(d);
    });
  } else eduSec.style.display = "none";

  const projSec = document.getElementById("r-proj-sec");
  const projList = document.getElementById("r-proj-list");
  projList.innerHTML = "";
  if ((state.projects || []).length) {
    projSec.style.display = "";
    state.projects.forEach((p) => {
      const d = document.createElement("div");
      d.className = "r-proj-item";
      d.innerHTML = `
        <div class="r-proj-header">
          <div class="r-proj-name">${x(p.name) || '<em style="color:#bfc5d8">Project Name</em>'}</div>
          ${p.link ? `<a class="r-proj-link" href="${x(p.link)}" target="_blank">${x(cleanUrl(p.link))}</a>` : ""}
        </div>
        ${p.tech ? `<div class="r-proj-tech">${x(p.tech)}</div>` : ""}
        ${p.desc ? `<div class="r-proj-desc">${x(p.desc)}</div>` : ""}
      `;
      projList.appendChild(d);
    });
  } else projSec.style.display = "none";

  const certSec = document.getElementById("r-cert-sec");
  const certList = document.getElementById("r-cert-list");
  certList.innerHTML = "";
  if ((state.certificates || []).length) {
    certSec.style.display = "";
    state.certificates.forEach((c) => {
      const d = document.createElement("div");
      d.className = "r-cert-item";
      d.innerHTML = `
        <div class="r-cert-header">
          <div class="r-cert-name">${x(c.name) || '<em style="color:#bfc5d8">Certificate Name</em>'}${c.link ? ` <a class="r-cert-link" href="${x(c.link)}" target="_blank">↗</a>` : ""}</div>
          ${c.date ? `<div class="r-cert-date">${x(c.date)}</div>` : ""}
        </div>
        ${c.issuer ? `<div class="r-cert-issuer">${x(c.issuer)}</div>` : ""}
      `;
      certList.appendChild(d);
    });
  } else certSec.style.display = "none";

  const skSec = document.getElementById("r-sk-sec");
  const skList = document.getElementById("r-sk-list");
  skList.innerHTML = "";
  const valid = (state.skills || []).filter(
    (g) => g.category || (g.values && g.values.length),
  );
  if (valid.length) {
    skSec.style.display = "";
    valid.forEach((g) => {
      const row = document.createElement("div");
      row.className = "r-skill-row";
      row.innerHTML = `<span class="r-skill-cat">${x(g.category || "Other")}:</span><span class="r-skill-vals">${x(g.values.join(", ") || "—")}</span>`;
      skList.appendChild(row);
    });
  } else skSec.style.display = "none";
}


function downloadPDF() {
  const el = document.getElementById("resume-doc");
  const name = state.personal.name || "Resume";
  const saved = {
    w: el.style.width,
    mh: el.style.minHeight,
    p: el.style.padding,
    fs: el.style.fontSize,
  };
  Object.assign(el.style, {
    width: "794px",
    minHeight: "1123px",
    padding: "50px 52px",
    fontSize: "",
  });
  html2pdf()
    .set({
      margin: 0,
      filename: name.replace(/\s+/g, "_") + "_Resume.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(el)
    .save()
    .then(() => {
      Object.assign(el.style, {
        width: saved.w,
        minHeight: saved.mh,
        padding: saved.p,
        fontSize: saved.fs,
      });
    });
}

function clearAll() {
  if (!confirm("Clear all resume data? This cannot be undone.")) return;
  localStorage.removeItem(STORE_KEY);
  location.reload();
}

function x(s) {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function cleanUrl(u) {
  return u ? u.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "") : "";
}
function ico(t) {
  return (
    {
      mail: `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>`,
      phone: `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.9a2 2 0 01-.5 2.1l-1.3 1.3a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.9.6 2.9.7a2 2 0 011.7 2z"/></svg>`,
      loc: `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
      web: `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>`,
      li: `<svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>`,
    }[t] || ""
  );
}

window.addEventListener("DOMContentLoaded", () => {
  load();
  if (window.innerWidth <= 680) setView("edit");
});