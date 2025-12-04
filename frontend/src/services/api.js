const BASE_URL = 'http://localhost:8000';

export async function getMetrics(projectId, limit = 50, sort) {
  const url = new URL(`${BASE_URL}/metrics/${projectId}`);
  if (limit) url.searchParams.set('limit', String(limit));
  if (sort) url.searchParams.set('sort', sort);
  const res = await fetch(url);
  return res.json();
}

export async function getRisks(projectId, tier, top = 10) {
  const url = new URL(`${BASE_URL}/risks/${projectId}`);
  if (tier) url.searchParams.set('tier', tier);
  if (top) url.searchParams.set('top', String(top));
  const res = await fetch(url);
  return res.json();
}

export async function getSmells(projectId, severity) {
  const url = new URL(`${BASE_URL}/smells/${projectId}`);
  if (severity) url.searchParams.set('severity', String(severity));
  const res = await fetch(url);
  return res.json();
}

export async function queueGithubRepo(sourceRef) {
  const res = await fetch(`${BASE_URL}/upload/repo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source_type: 'github', source_ref: sourceRef })
  });
  return res.json();
}

export async function startScan(projectId) {
  const res = await fetch(`${BASE_URL}/scan/project`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_id: projectId })
  });
  return res.json();
}

export async function getSuggestions(fileId, limit = 5) {
  const url = new URL(`${BASE_URL}/suggestions/${fileId}`);
  if (limit) url.searchParams.set('limit', String(limit));
  const res = await fetch(url);
  return res.json();
}

export async function exportReport(projectId, sections = []) {
  const res = await fetch(`${BASE_URL}/report/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_id: projectId, format: 'pdf', sections })
  });
  return res.blob();
}
