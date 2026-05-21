export function saveLocalContract(contract) {
  try {
    const key = "contracts:local";
    const raw = window.localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(contract);
    window.localStorage.setItem(key, JSON.stringify(list));
    console.log("Saved local contract", contract.id);
  } catch (e) {
    console.warn("Failed to save local contract", e);
  }
}

export function initCreateForm({ onSaved } = {}) {
  console.log("Initializing create form --->");
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

  function clearFieldErrors(form) {
    form.querySelectorAll(".error-message").forEach((n) => n.remove());
    form
      .querySelectorAll(".field-error")
      .forEach((n) => n.classList.remove("field-error"));
  }

  function showFieldError(input, message) {
    if (!input) return;
    input.classList.add("field-error");
    const msg = document.createElement("div");
    msg.className = "error-message";
    msg.textContent = message;
    input.parentNode.appendChild(msg);
  }

  function setSubmitting(isSubmitting) {
    const btn = form.querySelector('[type="submit"]');
    if (btn) btn.disabled = isSubmitting;
  }

  openBtn?.addEventListener("click", () => {
    if (form) form.hidden = false;
  });
  closeBtn?.addEventListener("click", () => {
    if (form) form.reset();
  });

  form?.addEventListener("submit", (ev) => {
    ev.preventDefault();
    clearFieldErrors(form);
    const fd = new FormData(form);
    const contractor = String(fd.get("contractor") || "").trim();
    const document = String(fd.get("document") || "").trim();
    const model = String(fd.get("model") || "").trim();
    const address = String(fd.get("address") || "").trim();

    // validation rules
    let valid = true;

    if (!contractor || contractor.length < 3) {
      const input = form.querySelector('[name="contractor"]');
      showFieldError(input, "Contratante é obrigatório (mínimo 2 caracteres)");
      valid = false;
    }

    // document: allow digits and punctuation, require at least 6 chars
    const docInput = form.querySelector('[name="document"]');
    if (!document || document.replace(/\D/g, "").length < 6) {
      showFieldError(docInput, "Documento é obrigatório (mínimo 6 dígitos)");
      valid = false;
    }

    if (!model) {
      const input = form.querySelector('[name="model"]');
      showFieldError(input, "Selecione um modelo");
      valid = false;
    }

    if (!valid) return;

    const newContract = {
      id: `local-${Date.now()}`,
      "model:": model,
      contractor,
      document,
      address,
      number: String(fd.get("number") || "").trim(),
      neighborhood: String(fd.get("neighborhood") || "").trim(),
      city: String(fd.get("city") || "").trim(),
      state: String(fd.get("state") || "").trim(),
      status: "draft",
    };

    setSubmitting(true);
    showSaving();
    // simulate save and persist to localStorage via request helper
    setTimeout(() => {
      // For now, just log the created contract instead of persisting it
      console.log("Created contract (not saved):", newContract);
      alert(
        "Contrato criado com sucesso! (Nota: este contrato é apenas simulado e não será salvo permanentemente)",
      );
      hideSaving();
      setSubmitting(false);
      form.reset();
      form.hidden = true;
      if (typeof onSaved === "function") onSaved(newContract);
    }, 600);
  });
}

// Auto-initialize when this module is loaded directly on a page with the create form
if (
  typeof document !== "undefined" &&
  document.querySelector("[data-create-form]")
) {
  initCreateForm();
}
