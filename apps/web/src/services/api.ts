const API_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:3333";

export async function fetchHealth() {
  const response = await fetch(`${API_URL}/health`);
  if (!response.ok) {
    throw new Error("Falha ao consultar API");
  }

  return response.json();
}
