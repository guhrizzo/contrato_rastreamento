"use client";

import React, { useRef, useState, useEffect } from "react";

interface SignatureCanvasProps {
  onSave: (signatureDataUrl: string) => void;
  onClear: () => void;
}

export default function SignatureCanvas({ onSave, onClear }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configurações de estilo do traço da assinatura
    ctx.strokeStyle = "#09090b"; // Preto profundo
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Tratar redimensionamento/densidade de pixels se necessário,
    // mas para um canvas de tamanho fixo, basta garantir o tamanho do elemento.
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Reconfigura o contexto após mudar width/height (pois limpará as propriedades)
    ctx.strokeStyle = "#09090b";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Impedir comportamento padrão de scroll em dispositivos touch ao desenhar no canvas
    const preventDefault = (e: Event) => {
      if (e.target === canvas) {
        e.preventDefault();
      }
    };

    document.body.addEventListener("touchstart", preventDefault, { passive: false });
    document.body.addEventListener("touchend", preventDefault, { passive: false });
    document.body.addEventListener("touchmove", preventDefault, { passive: false });

    return () => {
      document.body.removeEventListener("touchstart", preventDefault);
      document.body.removeEventListener("touchend", preventDefault);
      document.body.removeEventListener("touchmove", preventDefault);
    };
  }, []);

  // Obtém as coordenadas corretas relativas ao canvas
  const getCoordinates = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e.nativeEvent);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e.nativeEvent);

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Salva a assinatura automaticamente ao terminar o traço
    saveSignature();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    onClear();
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSigned) return;

    // Exporta o canvas como uma imagem base64
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-brand-black uppercase tracking-wider">
          Assinatura do Contratante
        </label>
        <span className="text-xs text-brand-gray">Use o mouse ou o dedo</span>
      </div>

      <div className="relative w-full h-44 bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden shadow-inner cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full"
        />
        {!hasSigned && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-sm text-zinc-400 font-medium">Assine aqui seu nome</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 mt-3">
        <button
          type="button"
          onClick={clearCanvas}
          className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-brand-black bg-zinc-100 hover:bg-zinc-200 rounded-md transition-all duration-200 cursor-pointer"
        >
          Limpar Assinatura
        </button>
      </div>
    </div>
  );
}
