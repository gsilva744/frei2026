import { QRCodeSVG } from "qrcode.react";

/* Mostra o QR Code de um visitante a partir do seu codigo unico */
function QRCodeVisitante({ codigo, tamanho = 160 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}>
      <QRCodeSVG value={codigo} size={tamanho} />
    </div>
  );
}

export default QRCodeVisitante;
