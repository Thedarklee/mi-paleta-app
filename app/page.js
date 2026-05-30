"use client";

import { useState, useRef } from 'react';
import chroma from 'chroma-js';
import { toPng } from 'html-to-image';

export default function Home() {
  const [baseColor, setBaseColor] = useState('#003e79');
  const [harmony, setHarmony] = useState('funcional');
  const [colorCount, setColorCount] = useState(5);
  
  // --- NUEVOS ESTADOS PARA CONTROLAR LA VISIBILIDAD ---
  const [activeColor, setActiveColor] = useState(null); // Guarda el índice del color tocado
  const [isExporting, setIsExporting] = useState(false); // Avisa si se está tomando la foto
  
  const paletteRef = useRef(null);

  const [r, g, b] = chroma.valid(baseColor) ? chroma(baseColor).rgb() : [0, 0, 0];

  const handleRgbChange = (index, value) => {
    const newRgb = [r, g, b];
    newRgb[index] = Number(value); 
    
    try {
      setBaseColor(chroma(newRgb).hex());
    } catch (e) {}
  };

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

  // --- FUNCIÓN DE EXPORTACIÓN ACTUALIZADA ---
  const handleExport = () => {
    if (paletteRef.current === null) return;
    
    // 1. Encendemos todos los textos
    setIsExporting(true);
    
    // 2. Le damos a React un instante (150ms) para pintar los textos en la pantalla
    setTimeout(() => {
      toPng(paletteRef.current, { cacheBust: true })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `paleta-${harmony}.png`;
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('Error al exportar la imagen:', err);
        })
        .finally(() => {
          // 3. Volvemos a ocultar los textos tras tomar la foto
          setIsExporting(false);
          setActiveColor(null);
        });
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 text-center">Generador de Paletas</h1>
      
      <div className="mb-8 flex flex-col lg:flex-row items-center lg:items-start gap-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full max-w-4xl">
        
        <div className="flex flex-col gap-6 w-full lg:w-1/2">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="font-medium text-gray-700 text-xs uppercase tracking-wide">Tipo de Paleta</label>
              <select 
                value={harmony}
                onChange={(e) => setHarmony(e.target.value)}
                className="border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 text-gray-900 p-2.5 outline-none w-full"
              >
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
                  className="border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 text-gray-900 p-2.5 outline-none w-full"
                >
                  {[5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num} className="text-gray-900 bg-white">{num}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

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

        <div className="hidden lg:block w-px h-32 bg-gray-200"></div>

        <div className="flex flex-col gap-4 w-full lg:w-1/2">
          <label className="font-medium text-gray-700 text-xs uppercase tracking-wide">
            Ajuste Fino ({harmony === 'funcional' ? 'RYB' : 'RGB'})
          </label>
          
          <div className="flex items-center gap-3">
            <span className="w-4 text-sm font-bold text-gray-500">R</span>
            <input 
              type="range" min="0" max="255" value={r} 
              onChange={(e) => handleRgbChange(0, e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <span className="w-8 text-sm font-mono text-right text-gray-600">{r}</span>
          </div>

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

      <div 
        ref={paletteRef} 
        className="flex w-full max-w-4xl h-48 rounded-2xl overflow-hidden shadow-lg mb-8 bg-white p-2 border border-gray-100"
      >
        {harmony === 'funcional' 
          ? funcColors.map((item, index) => (
              <div 
                key={index}
                /* Al hacer clic, guardamos este índice como el activo */ 
                onClick={() => setActiveColor(activeColor === index ? null : index)}
                className="flex-1 flex flex-col items-center justify-end pb-4 transition-all hover:flex-[1.3] group cursor-pointer"
                style={{ backgroundColor: item.hex }}
              >
                {/* Lógica maestra: Se muestra SI está exportando, SI fue tocado, O SI el mouse está encima */}
                <div className={`flex flex-col items-center gap-1 transition-opacity ${(isExporting || activeColor === index) ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100`}>
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
                /* Al hacer clic, guardamos este índice como el activo */ 
                onClick={() => setActiveColor(activeColor === index ? null : index)}
                className="flex-1 flex items-end justify-center pb-4 transition-all hover:flex-[1.3] group cursor-pointer"
                style={{ backgroundColor: color }}
              >
                {/* Lógica maestra: Se muestra SI está exportando, SI fue tocado, O SI el mouse está encima */}
                <span className={`bg-white/95 px-1 sm:px-2 py-1 rounded text-[10px] sm:text-xs font-mono text-gray-900 font-bold uppercase shadow-sm transition-opacity ${(isExporting || activeColor === index) ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100`}>
                  {color}
                </span>
              </div>
            ))
        }
      </div>

      <button 
        onClick={handleExport}
        disabled={isExporting} // Evitamos que el usuario haga spam de clics
        className="bg-gray-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? 'Procesando imagen...' : 'Exportar Paleta a PNG'}
      </button>
    </div>
  );
}