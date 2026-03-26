const CLIENT_ID = '339436983054-84m3ckulm3ud6hrp2jsbvm94la25jvru.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const FOLDER_NAME = 'ScleroApp - Pruebas Médicas';

let tokenClient = null;
let accessToken = null;

function loadGapiScript() {
  return new Promise((resolve) => {
    if (window.gapi) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

function loadGisScript() {
  return new Promise((resolve) => {
    if (window.google?.accounts) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

export async function initDrive() {
  await Promise.all([loadGapiScript(), loadGisScript()]);
  await new Promise((resolve) => window.gapi.load('client', resolve));
  await window.gapi.client.init({});
  await window.gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
}

export function getDriveToken() {
  return localStorage.getItem('sclero_drive_token');
}

export function saveDriveToken(token) {
  localStorage.setItem('sclero_drive_token', token);
  accessToken = token;
}

export function clearDriveToken() {
  localStorage.removeItem('sclero_drive_token');
  accessToken = null;
}

export function isDriveConnected() {
  return !!localStorage.getItem('sclero_drive_token');
}

export async function connectDrive() {
  await initDrive();
  return new Promise((resolve, reject) => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) { reject(new Error(response.error)); return; }
        saveDriveToken(response.access_token);
        resolve(response.access_token);
      },
    });
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

async function getOrCreateFolder() {
  const token = getDriveToken();
  // Search for existing folder
  const searchResp = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const searchData = await searchResp.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }
  // Create folder
  const createResp = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
  });
  const folder = await createResp.json();
  return folder.id;
}

export async function uploadPDFToDrive(fileName, arrayBuffer) {
  const token = getDriveToken();
  if (!token) throw new Error('No conectado a Google Drive');

  const folderId = await getOrCreateFolder();
  const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

  const metadata = { name: fileName, parents: [folderId] };
  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('file', blob);

  const resp = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!resp.ok) {
    if (resp.status === 401) { clearDriveToken(); throw new Error('Sesión de Drive expirada. Reconecta desde Configuración.'); }
    throw new Error('Error al subir a Drive: ' + resp.statusText);
  }

  const file = await resp.json();
  return { id: file.id, name: file.name, url: file.webViewLink };
}

export async function openDriveFile(fileId) {
  window.open(`https://drive.google.com/file/d/${fileId}/view`, '_blank');
}

export async function deleteDriveFile(fileId) {
  const token = getDriveToken();
  if (!token) return;
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}
