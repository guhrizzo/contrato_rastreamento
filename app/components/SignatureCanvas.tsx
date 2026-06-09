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

    // ResizeObserver para detectar redimensionamento e visibilidade (quando passa a ter tamanho maior que 0)
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.floor(entry.contentRect.width || canvas.offsetWidth);
        const height = Math.floor(entry.contentRect.height || canvas.offsetHeight);

        if (width > 0 && height > 0) {
          if (canvas.width !== width || canvas.height !== height) {
            // Salvar desenho anterior se existir
            let tempCanvas: HTMLCanvasElement | null = null;
            if (canvas.width > 0 && canvas.height > 0) {
              tempCanvas = document.createElement("canvas");
              tempCanvas.width = canvas.width;
              tempCanvas.height = canvas.height;
              const tempCtx = tempCanvas.getContext("2d");
              if (tempCtx) {
                tempCtx.drawImage(canvas, 0, 0);
              }
            }

            canvas.width = width;
            canvas.height = height;

            // Restaura propriedades do contexto pós redimensionamento
            const newCtx = canvas.getContext("2d");
            if (newCtx) {
              newCtx.strokeStyle = "#09090b";
              newCtx.lineWidth = 2.5;
              newCtx.lineCap = "round";
              newCtx.lineJoin = "round";

              if (tempCanvas && tempCanvas.width > 0 && tempCanvas.height > 0) {
                newCtx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, width, height);
              }
            }
          }
        }
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    } else {
      resizeObserver.observe(canvas);
    }

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
      resizeObserver.disconnect();
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
