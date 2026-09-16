import { QRCodeSVG } from "qrcode.react";

export function UpiQrCode({ upiId, shopName }: { upiId: string; shopName: string }) {
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(shopName)}`;
  return (
    <div className="rounded-2xl border border-red-100 bg-white p-4">
      <QRCodeSVG value={upiUrl} size={160} />
    </div>
  );
}
