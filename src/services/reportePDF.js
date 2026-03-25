import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

function clasificar(s, d) {
  if (s < 90 || d < 60) return 'Baja';
  if (s < 120 && d < 80) return 'Normal';
  if (s < 130 && d < 80) return 'Elevada';
  if (s < 140 || (d >= 80 && d < 90)) return 'Alta I';
  return 'Alta II';
}

function colorClasif(label) {
  const map = { 'Baja': '#3aaa97', 'Normal': '#0f766e', 'Elevada': '#f59e0b', 'Alta I': '#f97316', 'Alta II': '#dc2626' };
  return map[label] || '#666';
}

export async function generarReporteTension(uid, nombrePaciente, fechaDesde) {
  const q = query(
    collection(db, 'tension'),
    where('uid', '==', uid),
    where('fecha', '>=', fechaDesde),
    orderBy('fecha', 'asc')
  );
  const snap = await getDocs(q);
  const registros = snap.docs.map(d => d.data());

  if (registros.length === 0) {
    throw new Error('No hay registros de tensión a partir de esa fecha.');
  }

  // Calcular estadísticas
  const sistolicas = registros.map(r => r.sistolica);
  const diastolicas = registros.map(r => r.diastolica);
  const frecuencias = registros.filter(r => r.frecuencia_cardiaca).map(r => r.frecuencia_cardiaca);
  const avg = arr => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  const max = arr => Math.max(...arr);
  const min = arr => Math.min(...arr);

  const stats = {
    sistolicaMedia: avg(sistolicas),
    diastolicaMedia: avg(diastolicas),
    sistolicaMax: max(sistolicas),
    sistolicaMin: min(sistolicas),
    diastolicaMax: max(diastolicas),
    diastolicaMin: min(diastolicas),
    fcMedia: frecuencias.length > 0 ? avg(frecuencias) : null,
    total: registros.length,
    normales: registros.filter(r => clasificar(r.sistolica, r.diastolica) === 'Normal').length,
  };

  const fechaHoy = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  // Build HTML for PDF
  const rows = registros.map(r => {
    const clasif = clasificar(r.sistolica, r.diastolica);
    const color = colorClasif(clasif);
    return `
      <tr>
        <td>${r.fecha}</td>
        <td>${r.hora || '—'}</td>
        <td>${r.momento || '—'}</td>
        <td style="font-weight:600">${r.sistolica}/${r.diastolica}</td>
        <td>${r.frecuencia_cardiaca || '—'}</td>
        <td><span style="background:${color}20;color:${color};border:1px solid ${color}40;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600">${clasif}</span></td>
        <td style="font-size:11px;color:#666">${r.lugar || '—'}</td>
        <td style="font-size:11px;color:#666;font-style:italic">${r.notas || ''}</td>
      </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e2e2c; background: white; padding: 40px; font-size: 13px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #0f766e; }
    .logo { display: flex; align-items: center; gap: 12px; }
    .logo-icon { width: 44px; height: 44px; background: #0f766e; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .logo-icon svg { width: 24px; height: 24px; }
    .app-name { font-size: 22px; font-weight: 700; color: #0f766e; }
    .app-sub { font-size: 11px; color: #8fa39f; margin-top: 2px; }
    .report-meta { text-align: right; }
    .report-title { font-size: 16px; font-weight: 600; color: #1e2e2c; }
    .report-date { font-size: 11px; color: #8fa39f; margin-top: 4px; }
    .patient-box { background: #e6f4f1; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; display: flex; justify-content: space-between; }
    .patient-label { font-size: 11px; color: #095e57; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 3px; }
    .patient-value { font-size: 15px; font-weight: 600; color: #0f766e; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
    .stat-card { background: #f8faf9; border: 1px solid #b3ddd6; border-radius: 10px; padding: 12px 14px; text-align: center; }
    .stat-val { font-size: 22px; font-weight: 700; color: #0f766e; }
    .stat-label { font-size: 10px; color: #8fa39f; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.05em; }
    .section-title { font-size: 13px; font-weight: 600; color: #0f766e; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e6f4f1; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    th { background: #0f766e; color: white; padding: 9px 10px; font-size: 11px; font-weight: 600; text-align: left; }
    th:first-child { border-radius: 8px 0 0 0; }
    th:last-child { border-radius: 0 8px 0 0; }
    td { padding: 8px 10px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
    tr:nth-child(even) td { background: #f8faf9; }
    .rangos { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 24px; }
    .rango-item { border-radius: 8px; padding: 8px 10px; text-align: center; }
    .rango-label { font-size: 12px; font-weight: 700; }
    .rango-val { font-size: 10px; margin-top: 3px; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e6f4f1; display: flex; justify-content: space-between; font-size: 10px; color: #8fa39f; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      </div>
      <div>
        <div class="app-name">ScleroApp</div>
        <div class="app-sub">Sistema de Control y Seguimiento para pacientes ES</div>
      </div>
    </div>
    <div class="report-meta">
      <div class="report-title">Informe de Tensión Arterial</div>
      <div class="report-date">Generado el ${fechaHoy}</div>
      <div class="report-date">Período: desde ${fechaDesde}</div>
    </div>
  </div>

  <div class="patient-box">
    <div>
      <div class="patient-label">Paciente</div>
      <div class="patient-value">${nombrePaciente || 'Paciente'}</div>
    </div>
    <div style="text-align:right">
      <div class="patient-label">Total de mediciones</div>
      <div class="patient-value">${stats.total} registros</div>
    </div>
  </div>

  <div class="section-title">Resumen estadístico</div>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-val">${stats.sistolicaMedia}/${stats.diastolicaMedia}</div>
      <div class="stat-label">Media mmHg</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">${stats.sistolicaMax}/${stats.diastolicaMax}</div>
      <div class="stat-label">Máxima</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">${stats.sistolicaMin}/${stats.diastolicaMin}</div>
      <div class="stat-label">Mínima</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">${stats.fcMedia || '—'}</div>
      <div class="stat-label">FC media ppm</div>
    </div>
  </div>

  <div class="section-title">Referencia de rangos</div>
  <div class="rangos">
    <div class="rango-item" style="background:#3aaa9720;border:1px solid #3aaa9740">
      <div class="rango-label" style="color:#3aaa97">Baja</div>
      <div class="rango-val" style="color:#3aaa97">&lt;90/60</div>
    </div>
    <div class="rango-item" style="background:#0f766e20;border:1px solid #0f766e40">
      <div class="rango-label" style="color:#0f766e">Normal</div>
      <div class="rango-val" style="color:#0f766e">&lt;120/80</div>
    </div>
    <div class="rango-item" style="background:#f59e0b20;border:1px solid #f59e0b40">
      <div class="rango-label" style="color:#f59e0b">Elevada</div>
      <div class="rango-val" style="color:#f59e0b">120-129/&lt;80</div>
    </div>
    <div class="rango-item" style="background:#f9731620;border:1px solid #f9731640">
      <div class="rango-label" style="color:#f97316">Alta I</div>
      <div class="rango-val" style="color:#f97316">130-139/80-89</div>
    </div>
    <div class="rango-item" style="background:#dc262620;border:1px solid #dc262640">
      <div class="rango-label" style="color:#dc2626">Alta II</div>
      <div class="rango-val" style="color:#dc2626">≥140/≥90</div>
    </div>
  </div>

  <div class="section-title">Registro detallado de mediciones</div>
  <table>
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Hora</th>
        <th>Momento</th>
        <th>Tensión</th>
        <th>FC</th>
        <th>Clasificación</th>
        <th>Centro</th>
        <th>Notas</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="footer">
    <span>ScleroApp · Informe generado automáticamente · ${fechaHoy}</span>
    <span>Este documento es de uso personal. Consulte siempre con su médico.</span>
  </div>
</body>
</html>`;

  // Open in new window for printing/saving as PDF
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 800);

  return stats.total;
}
