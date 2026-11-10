import React from 'react';
import { X, Download, ZoomIn } from 'lucide-react';

interface ImageLightboxModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  imageUrl,
  onClose,
}) => {
  if (!imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `taskflow_screenshot_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in select-none"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div 
        className="w-full max-w-4xl flex items-center justify-between text-slate-300 pb-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-2 text-xs">
          <ZoomIn className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-slate-200">Aperçu de la capture d'écran</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded text-xs transition-colors cursor-pointer"
            title="Télécharger l'image"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Fermer (Échap)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div 
        className="max-w-5xl max-h-[82vh] overflow-hidden rounded-xl border border-white/20 shadow-2xl bg-[#11141e] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt="Illustration agrandie"
          className="max-w-full max-h-[82vh] object-contain"
        />
      </div>

      <div className="text-slate-500 text-xs mt-3">
        Cliquez en dehors de l'image ou appuyez sur Échap pour fermer
      </div>
    </div>
  );
};
