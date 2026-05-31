"use client";

import { useState, useRef, useEffect } from 'react';
import chroma from 'chroma-js';
import { toPng } from 'html-to-image';

export default function Home() {
  const [baseColor, setBaseColor] = useState('#003e79');
  const [harmony, setHarmony] = useState('funcional');
  const [colorCount, setColorCount] = useState(5);
  
  const [activeColor, setActiveColor] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false); // Estado para el botón de copiar
  
  // --- ESTADOS PARA GUARDAR PALETAS ---
  const [savedPalettes, setSavedPalettes] = useState([]);
  const [paletteName, setPaletteName] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  
  const paletteRef = useRef(null);

  const [r, g, b] = chroma.valid(baseColor) ? chroma(baseColor).rgb() : [0, 0, 0];

  useEffect(() => {
    setIsMounted(true);
    const saved = JSON.parse(localStorage.getItem('mis_paletas') || '[]');
    setSavedPalettes(saved);
  }, []);

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
        case 'monocromatico': return chroma.scale([c.brighten(2.5), c, c.darken(2.5)]).mode('lch').colors(count);
        case 'analogo': return chroma.scale([c.set('hsl.h', '-60'), c, c.set('hsl.h', '+60')]).mode('lch').colors(count);
        case 'complementario': return chroma.scale([c, '#f3f4f6', c.set('hsl.h', '+180')]).mode('lch').colors(count);
        case 'triadico': return chroma.scale([c, c.set('hsl.h', '+120'), c.set('hsl.h', '+240')]).mode('lch').colors(count);
        default: return Array(count).fill(color);
      }
    } catch (error) { return Array(count).fill('#cccccc'); }
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
    } catch (error) { return Array(5).fill({ label: 'ERR', hex: '#cccccc' }); }
  };

  const palette = generatePalette(baseColor, harmony, colorCount);
  const funcColors = getFunctionalColors(baseColor);

  // --- COPIAR AL PORTAPAPELES ---
  const handleCopyColors = () => {
    let textToCopy = '';
    
    if (harmony === 'funcional') {
      textToCopy = funcColors.map(c => `${c.label}: ${c.hex}`).join('\n');
    } else {
      textToCopy = palette.join(', ');
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Vuelve a la normalidad en 2 segundos
    });
  };

  // --- GUARDADO LOCAL ---
  const handleSavePalette = () => {
    if (!paletteName.trim()) return;
    
    const newPalette = {
      id: Date.now(),
      name: paletteName,
      baseColor,
      harmony,
      colorCount,
      previewColors: harmony === 'funcional' ? funcColors.map(c => c.hex) : palette 
    };

    const updatedPalettes = [newPalette, ...savedPalettes];
    setSavedPalettes(updatedPalettes);
    localStorage.setItem('mis_paletas', JSON.stringify(updatedPalettes));
    setPaletteName('');
  };

  const loadSavedPalette = (savedItem) => {
    setBaseColor(savedItem.baseColor);
    setHarmony(savedItem.harmony);
    setColorCount(savedItem.colorCount);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteSavedPalette = (id) => {
    const updatedPalettes = savedPalettes.filter(p => p.id !== id);
    setSavedPalettes(updatedPalettes);
    localStorage.setItem('mis_paletas', JSON.stringify(updatedPalettes));
  };

  const handleExport = () => {
    if (paletteRef.current === null) return;
    setIsExporting(true);
    setTimeout(() => {
      toPng(paletteRef.current, { cacheBust: true })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `paleta-${harmony}.png`;
          link.href = dataUrl;
          link.click();
        })
        .finally(() => {
          setIsExporting(false);
          setActiveColor(null);
        });
    }, 150);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col items-center py-12 px-4 sm:px-8">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900 tracking-tight text-center">Generador de Paletas</h1>
      
      {/* Controles Principales */}
      <div className="mb-8 flex flex-col lg:flex-row items-center lg:items-start gap-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full max-w-4xl">
        <div className="flex flex-col gap-6 w-full lg:w-1/2">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex flex-col gap-2">
              <label className="font-medium text-gray-700 text-xs uppercase tracking-wide">Tipo de Paleta</label>
              <select value={harmony} onChange={(e) => setHarmony(e.target.value)} className="border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-900 p-2.5 outline-none w-full focus:ring-2 focus:ring-blue-500 transition-shadow">
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
                <select value={colorCount} onChange={(e) => setColorCount(Number(e.target.value))} className="border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-900 p-2.5 outline-none w-full focus:ring-2 focus:ring-blue-500 transition-shadow">
                  {[5, 6, 7, 8, 9, 10].map(num => <option key={num} value={num} className="text-gray-900 bg-white">{num}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <input type="color" value={baseColor} onChange={(e) => setBaseColor(e.target.value)} className="w-14 h-14 cursor-pointer border-0 rounded-lg bg-transparent hover:scale-105 transition-transform"/>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">HEX</span>
              <span className="font-mono text-lg font-bold text-gray-800 uppercase">{baseColor}</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-px h-32 bg-gray-200"></div>

        <div className="flex flex-col gap-4 w-full lg:w-1/2">
          <label className="font-medium text-gray-700 text-xs uppercase tracking-wide">Ajuste Fino ({harmony === 'funcional' ? 'RYB' : 'RGB'})</label>
          {['R', harmony === 'funcional' ? 'Y' : 'G', 'B'].map((label, idx) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-4 text-sm font-bold text-gray-500">{label}</span>
              <input type="range" min="0" max="255" value={[r, g, b][idx]} onChange={(e) => handleRgbChange(idx, e.target.value)} className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${idx === 0 ? 'accent-red-500' : idx === 1 ? (harmony === 'funcional' ? 'accent-amber-400' : 'accent-green-500') : 'accent-blue-500'}`}/>
              <span className="w-8 text-sm font-mono text-right text-gray-600">{[r, g, b][idx]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contenedor Visual de la Paleta */}
      <div ref={paletteRef} className="flex w-full max-w-4xl h-56 rounded-2xl overflow-hidden shadow-xl mb-8 bg-white p-2 border border-gray-100 relative">
        {harmony === 'funcional' 
          ? funcColors.map((item, index) => (
              <div key={index} onClick={() => setActiveColor(activeColor === index ? null : index)} className="flex-1 flex flex-col items-center justify-end pb-6 transition-all hover:flex-[1.3] group cursor-pointer" style={{ backgroundColor: item.hex }}>
                <div className={`flex flex-col items-center gap-1.5 transition-opacity duration-300 ${(isExporting || activeColor === index) ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100`}>
                  <span className="bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest shadow-sm">{item.label}</span>
                  <span className="bg-white/95 px-2.5 py-1.5 rounded text-xs font-mono text-gray-900 font-bold uppercase shadow-md">{item.hex}</span>
                </div>
              </div>
            ))
          : palette.map((color, index) => (
              <div key={index} onClick={() => setActiveColor(activeColor === index ? null : index)} className="flex-1 flex items-end justify-center pb-6 transition-all hover:flex-[1.3] group cursor-pointer" style={{ backgroundColor: color }}>
                <span className={`bg-white/95 px-2.5 py-1.5 rounded text-xs font-mono text-gray-900 font-bold uppercase shadow-md transition-opacity duration-300 ${(isExporting || activeColor === index) ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100`}>{color}</span>
              </div>
            ))
        }
      </div>

      {/* Acciones: Guardar, Copiar y Exportar */}
      <div className="flex flex-col lg:flex-row w-full max-w-4xl gap-4 mb-16 justify-between items-center">
        
        {/* Sección Izquierda: Input Guardar */}
        <div className="w-full lg:w-1/2 flex items-center bg-white p-2 rounded-xl shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
          <input 
            type="text" 
            placeholder='Ej: "Paleta UI Mobile"' 
            value={paletteName}
            onChange={(e) => setPaletteName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSavePalette()}
            className="flex-1 px-4 py-2 outline-none text-gray-700 bg-transparent"
          />
          <button 
            onClick={handleSavePalette}
            disabled={!paletteName.trim()}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Guardar
          </button>
        </div>

        {/* Sección Derecha: Copiar y Exportar */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button 
            onClick={handleCopyColors}
            className="bg-white text-gray-800 border border-gray-200 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            {isCopied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ¡Copiado!
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Copiar HEX
              </>
            )}
          </button>

          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="bg-gray-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-800 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {isExporting ? 'Procesando...' : 'Exportar PNG'}
          </button>
        </div>
      </div>

      {/* Sección de Paletas Guardadas */}
      {savedPalettes.length > 0 && (
        <div className="w-full max-w-4xl">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span>Tus Paletas Guardadas</span>
            <span className="bg-gray-200 text-gray-600 text-xs py-1 px-2.5 rounded-full">{savedPalettes.length}</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {savedPalettes.map((saved) => (
              <div key={saved.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 truncate max-w-[160px]" title={saved.name}>{saved.name}</h3>
                    <p className="text-xs text-gray-500 capitalize">{saved.harmony} {saved.harmony !== 'funcional' && `(${saved.colorCount})`}</p>
                  </div>
                  <button onClick={() => deleteSavedPalette(saved.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Eliminar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
                
                <div className="flex h-12 rounded-lg overflow-hidden mb-4 border border-gray-50 cursor-pointer" onClick={() => loadSavedPalette(saved)}>
                  {saved.previewColors.map((colorHex, i) => (
                    <div key={i} className="flex-1" style={{ backgroundColor: colorHex }}></div>
                  ))}
                </div>

                <button onClick={() => loadSavedPalette(saved)} className="w-full bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors mt-auto">
                  Cargar Paleta
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}