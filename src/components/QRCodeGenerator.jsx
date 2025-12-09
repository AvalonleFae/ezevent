import React, { useEffect, useRef } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';

function QRCodeGenerator({ value, size = 200, onDataUrl }) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !onDataUrl) return;
    // QRCodeSVG renders as SVG, so we need to convert it to a data URL
    const svg = wrapper.querySelector('svg');
    if (!svg) return;
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        onDataUrl(dataUrl);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch (e) {
      console.error('Error converting SVG to PNG:', e);
    }
  }, [value, onDataUrl]);

  const displayValue = value || 'test qr code';

  return (
    <div ref={wrapperRef} style={{ padding: '20px', backgroundColor: '#f0f0f0', display: 'inline-block' }}>
      <h3>Scan Me!</h3>
      <QRCode
        value={displayValue}
        size={size}
        level="H"
        bgColor="#FFFFFF"
        fgColor="#000000"
      />
      <p style={{ marginTop: '10px', wordBreak: 'break-all' }}>Data: {displayValue}</p>
    </div>
  );
}

export default QRCodeGenerator;
