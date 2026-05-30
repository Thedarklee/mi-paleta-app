// pages/index.js (o app/page.js dependiendo de tu versión de Next.js)
import { useState, useRef } from 'react';
import chroma from 'chroma-js';
import { toPng } from 'html-to-image';

export default function Home() {
  const [baseColor, setBaseColor] = useState('#3b82f6'); // Azul por defecto
  const paletteRef = useRef(null);

  // Genera una paleta de 5 colores desde una versión clara hasta una oscura del color base
  const palette = chroma.scale(['white', baseColor, 'black'])
                        .mode('lch')
                        .colors(7)
                        .slice(1, 6); // Tomamos 5 colores intermedios

  const handleExport = () => {
    if (paletteRef.current === null) return;
    
    toPng(paletteRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'mi-paleta.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Error al exportar la imagen:', err);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">Generador de Paletas</h1>
      
      {/* Selector de Color */}
      <div className="mb-8 flex items-center gap-4">
        <label className="font-medium text-gray-700">Elige un color base:</label>
        <input 
          type="color" 
          value={baseColor} 
          onChange={(e) => setBaseColor(e.target.value)}
          className="w-12 h-12 cursor-pointer border-0 rounded"
        />
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
            <span className="bg-white/80 px-2 py-1 rounded text-sm font-mono text-gray-900 font-bold uppercase shadow-sm">
              {color}
            </span>
          </div>
        ))}
      </div>

      {/* Botón de Exportar */}
      <button 
        onClick={handleExport}
        className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-md"
      >
        Exportar a PNG
      </button>
    </div>
  );
}