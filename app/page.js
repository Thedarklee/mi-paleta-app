"use client";

import { useState, useRef } from 'react';
import chroma from 'chroma-js';
import { toPng } from 'html-to-image';

export default function Home() {
  const [baseColor, setBaseColor] = useState('#003e79'); // Empezamos con el azul de tu ejemplo
  const [harmony, setHarmony] = useState('funcional'); // Nueva opción por defecto
  const [colorCount, setColorCount] = useState(5);
  const paletteRef = useRef(null);

  // --- 1. LÓGICA DE PALETAS LINEALES (5 a 10 colores) ---
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

  // --- 2. LÓGICA DE PALETA FUNCIONAL RYB (La Cruz) ---
  const getFunctionalColors = (color) => {
    try {
      const c = chroma(color);
      return {
        main: c.hex(),
        similar: c.brighten(0.8).saturate(1.5).hex(), // Más vivo y brillante
        shadow: c.darken(1.5).desaturate(0.5).hex(),  // Más oscuro y apagado
        complement: c.set('hsl.h', '+180').hex(),     // Opuesto digital
        contrast: c.set('hsl.h', '+130').brighten(0.5).hex() // Triádico ajustado
      };
    } catch (error) {
      return { main: '#ccc', similar: '#ccc', shadow: '#ccc', complement: '#ccc', contrast: '#ccc' };
    }
  };

  const palette = generatePalette(baseColor, harmony, colorCount);
  const funcColors = getFunctionalColors(baseColor);

  const handleExport = () => {
    if (paletteRef.current === null) return;
    
    // Añadimos backgroundColor white para que la cruz no tenga fondo transparente al exportar
    toPng(paletteRef.current, { cacheBust: true, backgroundColor: '#ffffff' })
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

  // --- COMPONENTE DE BLOQUE PARA LA CRUZ ---
  const ColorBlock = ({ title, color, isMain }) => (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</span>
      <div
        className={`rounded-2xl shadow-md flex items-end justify-center pb-3 transition-transform hover:scale-105 ${
          isMain ? 'w-24 h-24 sm:w-32 sm:h-32 shadow-xl z-10 border-4 border-white/20' : 'w-20 h-20 sm:w-24 sm:h-24'
        }`}
        style={{ backgroundColor: color }}
      >
        <span className="bg-white/90 px-2 py-1 rounded text-[10px] font-mono text-gray-900 font-bold uppercase shadow-sm">
          {color}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 text-center">Generador de Paletas</h1>
      
      {/* Controles */}
      <div className="mb-8 flex flex-col sm:flex-row flex-wrap justify-center items-center gap-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        
        {/* Color Base */}
        <div className="flex items-center gap-3">
          <label className="font-medium text-gray-700 text-sm uppercase tracking-wide">Color Base</label>
          <input 
            type="color" 
            value={baseColor} 
            onChange={(e) => setBaseColor(e.target.value)}
            className="w-10 h-10 cursor-pointer border-0 rounded bg-transparent"
          />
        </div>
        
        <div className="hidden sm:block w-px h-8 bg-gray-200"></div>

        {/* Armonía */}
        <div className="flex items-center gap-3">
          <label className="font-medium text-gray-700 text-sm uppercase tracking-wide">Tipo de Paleta</label>
          <select 
            value={harmony}
            onChange={(e) => setHarmony(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2 outline-none"
          >
            <option value="funcional">Funcional (RYB)</option>
            <option value="monocromatico">Monocromático</option>
            <option value="analogo">Análogo</option>
            <option value="complementario">Complementario</option>
            <option value="triadico">Triádico</option>
          </select>
        </div>

        {/* Cantidad de Colores (Se oculta si está en modo Funcional) */}
        {harmony !== 'funcional' && (
          <>
            <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
            <div className="flex items-center gap-3">
              <label className="font-medium text-gray-700 text-sm uppercase tracking-wide">Colores</label>
              <select 
                value={colorCount}
                onChange={(e) => setColorCount(Number(e.target.value))}
                className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2 outline-none"
              >
                {[5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* ÁREA DE RENDERIZADO CONDICIONAL */}
      {harmony === 'funcional' ? (
        
        /* 1. Layout de Cruz (Funcional) */
        <div 
          ref={paletteRef} 
          className="bg-[#fafaf8] p-8 sm:p-12 rounded-3xl shadow-lg mb-8 w-full max-w-2xl flex items-center justify-center border border-gray-100"
        >
          <div className="grid grid-cols-3 grid-rows-3 gap-2 sm:gap-6 items-center justify-items-center">
            {/* Fila 1 */}
            <div className="col-start-2 row-start-1">
              <ColorBlock title="CONTRAST" color={funcColors.contrast} />
            </div>
            
            {/* Fila 2 */}
            <div className="col-start-1 row-start-2">
              <ColorBlock title="SHADOW" color={funcColors.shadow} />
            </div>
            <div className="col-start-2 row-start-2">
              <ColorBlock title="MAIN COLOR" color={funcColors.main} isMain={true} />
            </div>
            <div className="col-start-3 row-start-2">
              <ColorBlock title="SIMILAR" color={funcColors.similar} />
            </div>
            
            {/* Fila 3 */}
            <div className="col-start-2 row-start-3">
              <ColorBlock title="COMPLEMENT" color={funcColors.complement} />
            </div>
          </div>
        </div>

      ) : (

        /* 2. Layout Lineal Tradicional (El que ya tenías) */
        <div 
          ref={paletteRef} 
          className="flex w-full max-w-4xl h-48 rounded-xl overflow-hidden shadow-lg mb-8 bg-white p-2"
        >
          {palette.map((color, index) => (
            <div 
              key={index} 
              className="flex-1 flex items-end justify-center pb-4 transition-all hover:flex-[1.5] group"
              style={{ backgroundColor: color }}
            >
              <span className="bg-white/90 px-1 sm:px-2 py-1 rounded text-[10px] sm:text-xs font-mono text-gray-900 font-bold uppercase shadow-sm opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                {color}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Botón de Exportar */}
      <button 
        onClick={handleExport}
        className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-md flex items-center gap-2"
      >
        Exportar Paleta a PNG
      </button>
    </div>
  );
}