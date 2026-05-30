"use client";

import { useState, useRef } from 'react';
import chroma from 'chroma-js';
import { toPng } from 'html-to-image';

export default function Home() {
  const [baseColor, setBaseColor] = useState('#003e79');
  const [harmony, setHarmony] = useState('funcional');
  const [colorCount, setColorCount] = useState(5);
  const paletteRef = useRef(null);

  // --- OBTENER VALORES RGB ACTUALES ---
  const [r, g, b] = chroma.valid(baseColor) ? chroma(baseColor).rgb() : [0, 0, 0];

  // --- MANEJADOR DE LOS DESLIZADORES ---
  const handleRgbChange = (index, value) => {
    const newRgb = [r, g, b];
    newRgb[index] = Number(value); 
    
    try {
      setBaseColor(chroma(newRgb).hex());
    } catch (e) {}
  };

  // --- 1. LÓGICA DE PALETAS LINEALES ---
  const generatePalette = (color, rule, count) => {
    try {
      const c = chroma(color);
      switch (rule) {
        case 'monocromatico':
          return chroma.scale([c.brighten(2.5), c, c.darken(2.5)]).mode('lch').colors(count);
        case 'analogo':
          return chroma.scale([c.set('hsl.h', '-60'), c, c.set('hsl.h', '+60')]).mode('lch').colors(count);
        case 'complementario':
          const comp = c.set('hsl.h', '+180');
          return chroma.scale([c, '#f3f4f6', comp]).mode('lch').colors(count);
        case 'triadico':
          const t1 = c.set('hsl.h', '+120');
          const t2 = c.set('hsl.h', '+240');
          return chroma.scale([c, t1, t2]).mode('lch').colors(count);
        default:
          return Array(count).fill(color);
      }
    } catch (error) {
      return Array(count).fill('#cccccc');
    }
  };

  // --- 2. LÓGICA DE PALETA FUNCIONAL RYB ---
  const getFunctionalColors = (color) => {
    try {
      const c = chroma(color);
      return [
        { label: 'SHADOW', hex: c.darken(1.5).desaturate(0.5).hex() },
        { label: 'MAIN', hex: c.hex() },
        { label: 'SIMILAR', hex: c.brighten(0.8).saturate(1.5).hex() },
        { label: 'COMPLEMENT', hex: c.set('hsl.h', '+180').hex() },
        { label: 'CONTRAST', hex: c.set('hsl.h', '+130').brighten(0.5).hex() }
      ];
    } catch (error) {
      return Array(5).fill({ label: 'ERROR', hex: '#cccccc' });
    }
  };

  const palette = generatePalette(baseColor, harmony, colorCount);
  const funcColors = getFunctionalColors(baseColor);

  const handleExport = () => {
    if (paletteRef.current === null) return;
    
    toPng(paletteRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `paleta-${harmony}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Error al exportar la imagen:', err);
      });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 text-center">Generador de Paletas</h1>
      
      {/* Contenedor Principal de Controles */}
      <div className="mb-8 flex flex-col lg:flex-row items-center lg:items-start gap-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full max-w-4xl">
        
        {/* Columna Izquierda: Selectores de Modo y Color */}
        <div className="flex flex-col gap-6 w-full lg:w-1/2">
          {/* Armonía y Cantidad */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="font-medium text-gray-700 text-xs uppercase tracking-wide">Tipo de Paleta</label>
              <select 
                value={harmony}
                onChange={(e) => setHarmony(e.target.value)}
                /* Se agregó text-gray-900 explícito aquí */
                className="border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 text-gray-900 p-2.5 outline-none w-full"
              >
                {/* Se agregó text-gray-900 y bg-white a cada opción */}
                <option value="funcional" className="text-gray-900 bg-white">Funcional (RYB)</option>
                <option value="monocromatico" className="text-gray-900 bg-white">Monocromático</option>
                <option value="analogo" className="text-gray-900 bg-white">Análogo</option>
                <option value="complementario" className="text-gray-900 bg-white">Complementario</option>
                <option value="triadico" className="text-gray-900 bg-white">Triádico</option>
              </select>
            </div>

            {harmony !== 'funcional' && (
              <div className="flex-1 flex flex-col gap-2">
                <label className="font-medium text-gray-700 text-xs uppercase tracking-wide">Colores</label>
                <select 
                  value={colorCount}
                  onChange={(e) => setColorCount(Number(e.target.value))}
                  /* Se agregó text-gray-900 explícito aquí */
                  className="border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 text-gray-900 p-2.5 outline-none w-full"
                >
                  {[5, 6, 7, 8, 9, 10].map(num => (
                    /* Se agregó text-gray-900 y bg-white a cada opción */
                    <option key={num} value={num} className="text-gray-900 bg-white">{num}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Color Picker Nativo + Hex */}
          <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <input 
              type="color" 
              value={baseColor} 
              onChange={(e) => setBaseColor(e.target.value)}
              className="w-14 h-14 cursor-pointer border-0 rounded-lg bg-transparent"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">HEX</span>
              <span className="font-mono text-lg font-bold text-gray-800 uppercase">{baseColor}</span>
            </div>
          </div>
        </div>

        {/* Separador (solo en escritorio) */}
        <div className="hidden lg:block w-px h-32 bg-gray-200"></div>

        {/* Columna Derecha: Deslizadores RGB/RYB */}
        <div className="flex flex-col gap-4 w-full lg:w-1/2">
          <label className="font-medium text-gray-700 text-xs uppercase tracking-wide">
            Ajuste Fino ({harmony === 'funcional' ? 'RYB' : 'RGB'})
          </label>
          
          {/* Deslizador R (Rojo) */}
          <div className="flex items-center gap-3">
            <span className="w-4 text-sm font-bold text-gray-500">R</span>
            <input 
              type="range" min="0" max="255" value={r} 
              onChange={(e) => handleRgbChange(0, e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <span className="w-8 text-sm font-mono text-right text-gray-600">{r}</span>
          </div>

          {/* Deslizador G/Y (Verde o Amarillo) */}
          <div className="flex items-center gap-3">
            <span className="w-4 text-sm font-bold text-gray-500">
              {harmony === 'funcional' ? 'Y' : 'G'}
            </span>
            <input 
              type="range" min="0" max="255" value={g} 
              onChange={(e) => handleRgbChange(1, e.target.value)}
              className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${harmony === 'funcional' ? 'accent-amber-400' : 'accent-green-500'}`}
            />
            <span className="w-8 text-sm font-mono text-right text-gray-600">{g}</span>
          </div>

          {/* Deslizador B (Azul) */}
          <div className="flex items-center gap-3">
            <span className="w-4 text-sm font-bold text-gray-500">B</span>
            <input 
              type="range" min="0" max="255" value={b} 
              onChange={(e) => handleRgbChange(2, e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="w-8 text-sm font-mono text-right text-gray-600">{b}</span>
          </div>
        </div>
      </div>

      {/* Contenedor de la Paleta Unificado */}
      <div 
        ref={paletteRef} 
        className="flex w-full max-w-4xl h-48 rounded-2xl overflow-hidden shadow-lg mb-8 bg-white p-2 border border-gray-100"
      >
        {harmony === 'funcional' 
          ? funcColors.map((item, index) => (
              <div 
                key={index} 
                className="flex-1 flex flex-col items-center justify-end pb-4 transition-all hover:flex-[1.3] group"
                style={{ backgroundColor: item.hex }}
              >
                <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                  <span className="bg-black/40 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest shadow-sm">
                    {item.label}
                  </span>
                  <span className="bg-white/95 px-2 py-1 rounded text-[10px] sm:text-xs font-mono text-gray-900 font-bold uppercase shadow-sm">
                    {item.hex}
                  </span>
                </div>
              </div>
            ))
          : palette.map((color, index) => (
              <div 
                key={index} 
                className="flex-1 flex items-end justify-center pb-4 transition-all hover:flex-[1.3] group"
                style={{ backgroundColor: color }}
              >
                <span className="bg-white/95 px-1 sm:px-2 py-1 rounded text-[10px] sm:text-xs font-mono text-gray-900 font-bold uppercase shadow-sm opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                  {color}
                </span>
              </div>
            ))
        }
      </div>

      {/* Botón de Exportar */}
      <button 
        onClick={handleExport}
        className="bg-gray-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
      >
        Exportar Paleta a PNG
      </button>
    </div>
  );
}