import { queryContracts } from "./contracts.request.js";

function getIdFromQuery() {
  const params = new URLSearchParams(location.search);
  return params.get("id");
}

function renderContract(container, c) {
  if (!c) {
    container.innerHTML = "<p>Contrato não encontrado.</p>";
    return;
  }

  container.innerHTML = `
    <h2>${c.contractor}</h2>
    <p><strong>ID:</strong> ${c.id}</p>
    <p><strong>Modelo:</strong> ${c["model:"]}</p>
    <p><strong>Documento:</strong> ${c.document}</p>
    <p><strong>Email:</strong> ${c.email ?? ""}</p>
    <p><strong>Endereço:</strong> ${c.address ?? ""}, ${c.number ?? ""}</p>
    <p><strong>Cidade:</strong> ${c.city ?? ""} - ${c.state ?? ""}</p>
    <p><strong>Status:</strong> ${c.status}</p>
    
  `;
}

async function loadPreview() {
  const id = getIdFromQuery();
  const root = document.getElementById("preview-root");
  if (!root) return;
  root.textContent = "Carregando...";

  try {
    const res = await queryContracts({ page: 1, limit: 1000 });
    const c = res.data.find((x) => x.id === id);
    renderContract(root, c);
  } catch (e) {
    root.innerHTML = `<p>Erro ao carregar: ${e instanceof Error ? e.message : String(e)}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadPreview);
