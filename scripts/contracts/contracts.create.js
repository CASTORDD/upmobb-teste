import { saveLocalContract } from "./contracts.request.js";

export function initCreateForm({ onSaved } = {}) {
  const form = document.querySelector("[data-create-form]");
  const openBtn = document.querySelector("[data-open-create]");
  const closeBtn = document.querySelector("[data-close-create]");

  function showSaving() {
    const el = document.querySelector("[data-contracts-saving]");
    if (el) el.hidden = false;
  }
  function hideSaving() {
    const el = document.querySelector("[data-contracts-saving]");
    if (el) el.hidden = true;
  }

  openBtn?.addEventListener("click", () => {
    if (form) form.hidden = false;
  });
  closeBtn?.addEventListener("click", () => {
    if (form) form.hidden = true;
  });

  form?.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    const contractor = String(fd.get("contractor") || "").trim();
    const document = String(fd.get("document") || "").trim();
    const model = String(fd.get("model") || "").trim();

    if (!contractor || !document || !model) {
      alert(
        "Por favor preencha os campos obrigatórios: contratante, documento e modelo.",
      );
      return;
    }

    const newContract = {
      id: `local-${Date.now()}`,
      "model:": model,
      contractor,
      document,
      address: String(fd.get("address") || "").trim(),
      number: String(fd.get("number") || "").trim(),
      neighborhood: String(fd.get("neighborhood") || "").trim(),
      city: String(fd.get("city") || "").trim(),
      state: String(fd.get("state") || "").trim(),
      status: "draft",
    };

    showSaving();
    setTimeout(() => {
      saveLocalContract(newContract);
      hideSaving();
      form.reset();
      form.hidden = true;
      if (typeof onSaved === "function") onSaved(newContract);
    }, 600);
  });
}
function handleCreateForm() {
  const form = $("[data-create-form]");
  const openBtn = $("[data-open-create]");
  const closeBtn = $("[data-close-create]");

  openBtn?.addEventListener("click", () => {
    form.hidden = false;
  });
  closeBtn?.addEventListener("click", () => {
    form.hidden = true;
  });

  form?.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    const contractor = String(fd.get("contractor") || "").trim();
    const document = String(fd.get("document") || "").trim();
    const model = String(fd.get("model") || "").trim();
    const address = String(fd.get("address") || "").trim();

    // validation
    if (!contractor || !document || !model) {
      alert(
        "Por favor preencha os campos obrigatórios: contratante, documento e modelo.",
      );
      return;
    }

    const newContract = {
      id: `local-${Date.now()}`,
      "model:": model,
      contractor,
      document,
      address,
      number: fd.get("number") || "",
      neighborhood: fd.get("neighborhood") || "",
      city: fd.get("city") || "",
      state: fd.get("state") || "",
      status: "draft",
    };

    showSaving();
    // simulate save and persist to localStorage via request helper
    setTimeout(() => {
      saveLocalContract(newContract);
      hideSaving();
      form.reset();
      form.hidden = true;
      state.page = 1;
      loadContracts();
    }, 700);
  });
}
