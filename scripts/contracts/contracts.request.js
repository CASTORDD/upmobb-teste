const contractsJsonUrl = new URL("../../mokup/contracts.json", import.meta.url);

function normalizePagination(page, limit) {
  const safePage = Number.isFinite(Number(page)) ? Math.floor(Number(page)) : 1;
  const safeLimit = Number.isFinite(Number(limit))
    ? Math.floor(Number(limit))
    : 10;

  return {
    page: Math.max(1, safePage),
    limit: Math.max(1, safeLimit),
  };
}

async function loadAllContracts() {
  const response = await fetch(contractsJsonUrl);
  if (!response.ok)
    throw new Error(`Failed to load contracts.json: ${response.status}`);
  const payload = await response.json();
  let contracts = Array.isArray(payload?.contracts)
    ? payload.contracts.slice()
    : [];

  // Merge locally created contracts stored in localStorage (if running in browser)
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = window.localStorage.getItem("contracts:local");
      if (stored) {
        const local = JSON.parse(stored);
        if (Array.isArray(local)) {
          // local contracts should appear first
          contracts = local.concat(contracts);
        }
      }
    }
  } catch (e) {
    // ignore localStorage errors
  }

  return contracts;
}

function applyFilters(list, { contractor, document: doc, model, status }) {
  return list.filter((c) => {
    if (
      contractor &&
      !String(c.contractor || "")
        .toLowerCase()
        .includes(String(contractor).toLowerCase())
    )
      return false;
    if (
      doc &&
      !String(c.document || "")
        .toLowerCase()
        .includes(String(doc).toLowerCase())
    )
      return false;
    if (model && model !== "all" && String(c["model:"] || "") !== model)
      return false;
    if (status && status !== "all" && String(c.status || "") !== status)
      return false;
    return true;
  });
}

function applySort(list, sortBy, sortDir) {
  if (!sortBy) return list;
  const dir = sortDir === "desc" ? -1 : 1;
  return list.slice().sort((a, b) => {
    const va = String(a[sortBy] ?? "").toLowerCase();
    const vb = String(b[sortBy] ?? "").toLowerCase();
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  });
}

export async function queryContracts({
  page = 1,
  limit = 10,
  contractor,
  document: doc,
  model,
  status,
  sortBy,
  sortDir,
} = {}) {
  const pagination = normalizePagination(page, limit);
  const all = await loadAllContracts();

  const filtered = applyFilters(all, {
    contractor,
    document: doc,
    model,
    status,
  });
  const sorted = applySort(filtered, sortBy, sortDir);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pagination.limit));
  const currentPage = Math.min(pagination.page, totalPages);
  const startIndex = (currentPage - 1) * pagination.limit;
  const data = sorted.slice(startIndex, startIndex + pagination.limit);

  return {
    data,
    meta: {
      page: currentPage,
      limit: pagination.limit,
      total,
      totalPages,
      hasPrevPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    },
  };
}

export async function getContractsPaged(opts) {
  return queryContracts(opts);
}

export async function getContracts(page = 1, limit = 10) {
  return getContractsPaged({ page, limit });
}

export function saveLocalContract(contract) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    const key = "contracts:local";
    const raw = window.localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(contract);
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    // ignore
  }
}
