import React, { useState } from 'react';

export const HOSPITALES = [
  'Hospital Nº Señora de la Candelaria',
  'Hospital Universitario de Canarias',
  'Hospiten del Sur Mojón',
  'Hospiten Rambla',
  'Quirón Costa Adeje',
  'Quirón Los Cristianos',
  'Centro de Salud de El Fraile',
  'Otro (especificar)',
];

export function HospitalSelector({ value, onChange, placeholder = 'Seleccionar hospital...' }) {
  const esOtro = value && !HOSPITALES.slice(0, -1).includes(value);
  const [otro, setOtro] = useState(esOtro);
  const [otroVal, setOtroVal] = useState(esOtro ? value : '');

  function handleSelect(e) {
    const v = e.target.value;
    if (v === 'Otro (especificar)') {
      setOtro(true);
      onChange('');
    } else {
      setOtro(false);
      onChange(v);
    }
  }

  function handleOtro(e) {
    setOtroVal(e.target.value);
    onChange(e.target.value);
  }

  const selectValue = otro ? 'Otro (especificar)' : (value || '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <select className="input-field" value={selectValue} onChange={handleSelect} style={{ appearance: 'none' }}>
        <option value="">{placeholder}</option>
        {HOSPITALES.map(h => <option key={h} value={h}>{h}</option>)}
      </select>
      {otro && (
        <input className="input-field" value={otroVal} onChange={handleOtro}
          placeholder="Escribe el nombre del centro..." autoFocus />
      )}
    </div>
  );
}
