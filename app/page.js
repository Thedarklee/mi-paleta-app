"use client";

import { useState, useRef } from 'react';
import chroma from 'chroma-js';
import { toPng } from 'html-to-image';

export default function Home() {
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const [harmony, setHarmony] = useState('monocromatico');
  const [colorCount, setColorCount] = useState(5); // Nuevo estado para la cantidad
  const paletteRef = useRef(null);

  // Función actualizada: ahora genera N colores dinámicamente usando escalas
  const generatePalette = (color, rule, count) => {
    try {
      const c = chroma(color);
      
      switch (rule) {
        case 'monocromatico':
          // Escala del color aclarado al color oscurecido
          return chroma.scale([c.brighten(2.5), c, c.darken(2.5)])
                       .mode('lch')
                       .colors(count);
          
        case 'analogo':
          // Escala entre los vecinos (-60 y +60 grados en el círculo cromático)
          return chroma.scale([c.set('hsl.h', '-60'), c, c.set('hsl.h', '+60')])
                       .mode('lch')
                       .colors(count);
          
        case 'complementario':
          // Escala del color base a su opuesto, pasando por un gris claro para que no se vea "sucio"
          const comp = c.set('hsl.h', '+180');
          return chroma.scale([c, '#f3f4f6', comp])
                       .mode('lch')
                       .colors(count);
          
        case 'triadico':
          // Escala pasando por los tres puntos equidistantes
          const t1 = c.set('hsl.h', '+120');
          const t2 = c.set('hsl.h', '+240');
          return chroma.scale([c, t1, t2])
                       .mode('lch')
                       .colors(count);
          
        default:
          return Array(count).fill(color);
      }
    } catch (error) {
      return Array(count).fill('#cccccc');
    }
  };

  const palette = generatePalette(baseColor, harmony, colorCount);

  const handleExport = () => {
    if (paletteRef.current === null) return;
    
    toPng(paletteRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `paleta-${harmony}-${colorCount}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Error al exportar la imagen:', err);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 text-center">Generador de Paletas</h1>
      
      {/* Controles: Selector de Color, Regla y Cantidad */}
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
          <label className="font-medium text-gray-700 text-sm uppercase tracking-wide">Armonía</label>
          <select 
            value={harmony}
            onChange={(e) => setHarmony(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2 outline-none"
          >
            <option value="monocromatico">Monocromático</option>
            <option value="analogo">Análogo</option>
            <option value="complementario">Complementario</option>
            <option value="triadico">Triádico</option>
          </select>
        </div>

        <div className="hidden sm:block w-px h-8 bg-gray-200"></div>

        {/* Cantidad de Colores */}
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

      </div>

      {/* Contenedor de la Paleta (Este es el que se exporta) */}
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