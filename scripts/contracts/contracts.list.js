import { queryContracts } from "./contracts.request.js";
import { initCreateForm } from "./contracts.create.js";

const state = {
  page: 1,
  limit: 10,
  contractor: "",
  document: "",
  model: "all",
  status: "all",
  sortBy: "contractor",
  sortDir: "asc",
};

const statusLabel = {
  draft: "Draft",
  sent: "Sent",
  await: "Await",
  signed: "Signed",
  cancel: "Cancel",
};

function $(sel) {
  return document.querySelector(sel);
}

function getTableBody() {
  return $("[data-contracts-body]");
}

function getPagination() {
  return $("[data-contracts-pagination]");
}

function getEmptyState() {
  return $("[data-contracts-empty]");
}

function getLoadingState() {
  return $("[data-contracts-loading]");
}

function renderRows(contracts) {
  const body = getTableBody();
  if (!body) return;

  body.innerHTML = contracts
    .map(
      (contract) => `
      <tr>
        <td>${contract["model:"] ?? "-"}</td>
        <td>${contract.contractor ?? "-"}</td>
        <td>${contract.document ?? "-"}</td>
        <td>${contract.address ?? "-"}, ${contract.number ?? "-"}</td>
        <td>${statusLabel[contract.status] ?? contract.status ?? "-"}</td>
        <td>
          <button class="btn-actions" type="button" data-action="details" data-contract-id="${contract.id}">Detalhes</button>
          <button class="btn-actions" type="button" data-action="preview" data-contract-id="${contract.id}">Prévia</button>
        </td>
      </tr>
    `,
    )
    .join("");
}

function renderEmptyState(message) {
  const emptyState = getEmptyState();
  if (!emptyState) return;
  emptyState.textContent = message;
  emptyState.hidden = false;
}

function hideEmptyState() {
  const emptyState = getEmptyState();
  if (emptyState) emptyState.hidden = true;
}

function showLoading() {
  const el = getLoadingState();
  if (el) el.hidden = false;
}

function hideLoading() {
  const el = getLoadingState();
  if (el) el.hidden = true;
}

function renderPagination(meta) {
  const pagination = getPagination();
  if (!pagination) return;

  pagination.innerHTML = `
    <div class="contracts-pagination__actions">
      <button class="btn-actions" type="button" data-pagination-action="prev" ${meta.hasPrevPage ? "" : "disabled"}>Prev</button>
      <div class="contracts-pagination__summary">
        Página ${meta.page} de ${meta.totalPages} · ${meta.total} total
      </div>
      <button class="btn-actions" type="button" data-pagination-action="next" ${meta.hasNextPage ? "" : "disabled"}>Next</button>
    </div>
  `;
}

let lastLoadToken = 0;
async function loadContracts() {
  const token = ++lastLoadToken;
  showLoading();
  hideEmptyState();
  try {
    const { data, meta } = await queryContracts({
      page: state.page,
      limit: state.limit,
      contractor: state.contractor,
      document: state.document,
      model: state.model,
      status: state.status,
      sortBy: state.sortBy,
      sortDir: state.sortDir,
    });

    if (token !== lastLoadToken) return; // stale

    if (data.length === 0) {
      renderRows([]);
      renderEmptyState("No contracts found.");
      renderPagination(meta);
      return;
    }

    hideEmptyState();
    renderRows(data);
    renderPagination(meta);
  } catch (error) {
    renderRows([]);
    renderEmptyState(
      error instanceof Error ? error.message : "Failed to load contracts.",
    );
    const pagination = getPagination();
    if (pagination) pagination.innerHTML = "";
  } finally {
    hideLoading();
  }
}

function handlePaginationClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const action = target.dataset.paginationAction;
  if (action === "prev" && state.page > 1) {
    state.page -= 1;
    loadContracts();
  }
  if (action === "next") {
    state.page += 1;
    loadContracts();
  }
}

function handleTableActions(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const action = target.dataset.action;
  const id = target.dataset.contractId;
  if (!action || !id) return;

  if (action === "details") {
    showContractDetails(id);
  } else if (action === "preview") {
    showContractPreview(id);
  }
}

function showContractDetails(id) {
  const rows = getTableBody().querySelectorAll("tr");
  for (const r of rows) {
    const btn = r.querySelector(`[data-contract-id="${id}"]`);
    if (btn) {
      const cells = r.querySelectorAll("td");
      alert(
        "Detalhes:\n" +
          Array.from(cells)
            .map((c) => c.textContent.trim())
            .join("\n"),
      );
      return;
    }
  }
  alert("Contract not found");
}

function showContractPreview(id) {
  // open the dedicated preview page in the same folder as list.html
  const url = new URL("preview.html", location.href);
  url.searchParams.set("id", id);
  window.open(url.toString(), "_blank");
}

function handleControls() {
  const contractorInput = $("[data-filter-contractor]");
  const documentInput = $("[data-filter-document]");
  const modelSelect = $("[data-filter-model]");
  const statusSelect = $("[data-filter-status]");

  contractorInput?.addEventListener("input", () => {
    state.page = 1;
    state.contractor = contractorInput.value;
    debounceLoad();
  });

  documentInput?.addEventListener("input", () => {
    state.page = 1;
    state.document = documentInput.value;
    debounceLoad();
  });

  modelSelect?.addEventListener("change", () => {
    state.page = 1;
    state.model = modelSelect.value;
    loadContracts();
  });

  statusSelect?.addEventListener("change", () => {
    state.page = 1;
    state.status = statusSelect.value;
    loadContracts();
  });

  document.querySelectorAll("[data-sort]").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (state.sortBy === key) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortBy = key;
        state.sortDir = "asc";
      }
      loadContracts();
    });
  });
}

let debounceTimer = 0;
function debounceLoad() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => loadContracts(), 300);
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".container");
  if (container && !getLoadingState()) {
    const el = document.createElement("p");
    el.dataset.contractsLoading = "";
    el.textContent = "Carregando...";
    el.hidden = true;
    container.insertBefore(el, container.firstChild.nextSibling);
  }

  if (container && !document.querySelector("[data-contracts-saving]")) {
    const el = document.createElement("p");
    el.dataset.contractsSaving = "";
    el.textContent = "Salvando...";
    el.hidden = true;
    container.insertBefore(el, container.firstChild.nextSibling);
  }

  const pagination = getPagination();
  if (pagination) pagination.addEventListener("click", handlePaginationClick);

  const table = getTableBody();
  table?.addEventListener("click", handleTableActions);

  handleControls();
  initCreateForm({
    onSaved: () => {
      state.page = 1;
      loadContracts();
    },
  });

  loadContracts();
});
