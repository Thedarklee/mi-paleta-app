"use client";

import { useState, useRef } from 'react';
import chroma from 'chroma-js';
import { toPng } from 'html-to-image';

export default function Home() {
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const [harmony, setHarmony] = useState('monocromatico');
  const paletteRef = useRef(null);

  // Función para generar la paleta según la regla de teoría del color elegida
  const generatePalette = (color, rule) => {
    try {
      const c = chroma(color);
      
      switch (rule) {
        case 'monocromatico':
          // Escala de claro a oscuro del mismo tono
          return chroma.scale(['white', color, 'black']).mode('lch').colors(7).slice(1, 6);
          
        case 'analogo':
          // Colores vecinos en la rueda de color (-60, -30, 0, +30, +60 grados)
          return [
            c.set('hsl.h', '-60').hex(),
            c.set('hsl.h', '-30').hex(),
            c.hex(),
            c.set('hsl.h', '+30').hex(),
            c.set('hsl.h', '+60').hex()
          ];
          
        case 'complementario':
          // El opuesto (+180 grados) y variaciones de luz para completar 5 colores
          const comp = c.set('hsl.h', '+180');
          return [
            c.brighten(1).hex(),
            c.hex(),
            chroma.mix(c, comp, 0.5).hex(), // Un tono neutro mezclado en el medio
            comp.hex(),
            comp.darken(1).hex()
          ];
          
        case 'triadico':
          // Tres colores equidistantes (+120 y +240 grados) más variaciones
          const t1 = c.set('hsl.h', '+120');
          const t2 = c.set('hsl.h', '+240');
          return [
            c.brighten(0.5).hex(),
            c.hex(),
            t1.hex(),
            t2.hex(),
            t2.darken(0.8).hex()
          ];
          
        default:
          return Array(5).fill(color);
      }
    } catch (error) {
      // Por si el usuario borra el input del hex o mete algo inválido
      return Array(5).fill('#cccccc');
    }
  };

  const palette = generatePalette(baseColor, harmony);

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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Generador de Paletas</h1>
      
      {/* Controles: Selector de Color y Regla */}
      <div className="mb-8 flex flex-col sm:flex-row items-center gap-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
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

        <div className="flex items-center gap-3">
          <label className="font-medium text-gray-700 text-sm uppercase tracking-wide">Armonía</label>
          <select 
            value={harmony}
            onChange={(e) => setHarmony(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2"
          >
            <option value="monocromatico">Monocromático</option>
            <option value="analogo">Análogo</option>
            <option value="complementario">Complementario</option>
            <option value="triadico">Triádico</option>
          </select>
        </div>
      </div>

      {/* Contenedor de la Paleta (Este es el que se exporta) */}
      <div 
        ref={paletteRef} 
        className="flex w-full max-w-2xl h-48 rounded-xl overflow-hidden shadow-lg mb-8 bg-white p-2"
      >
        {palette.map((color, index) => (
          <div 
            key={index} 
            className="flex-1 flex items-end justify-center pb-4 transition-all hover:flex-[1.2]"
            style={{ backgroundColor: color }}
          >
            <span className="bg-white/90 px-2 py-1 rounded text-sm font-mono text-gray-900 font-bold uppercase shadow-sm">
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