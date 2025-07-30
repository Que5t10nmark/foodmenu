"use client";

import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import QRCode from "react-qr-code";

export default function QRCodePrintPage() {
  const params = useParams();
  const seat_qrcode = params.seat_qrcode || "";
  const printUrl =
    typeof window !== "undefined"
      ? window.location.origin + "/order/product/" + seat_qrcode
      : "";

  useEffect(() => {
    setTimeout(() => {
      window.print();
    }, 500);

    window.onafterprint = () => {
      window.close();
    };
  }, []);

  return (
    <>
      <style>{`
        @page {
          size: 7cm 7cm;
          margin: 0;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 7cm;
            height: 7cm;
          }
          button {
            display: none !important;
          }
        }
      `}</style>

      <div
        id="print-area"
        className="flex flex-col items-center justify-center w-[7cm] h-[7cm] border border-gray-700 rounded-md p-4 box-border bg-white select-none"
      >
        <h1 className="text-2xl font-bold mb-2 text-center">โต๊ะ {seat_qrcode}</h1>
        <QRCode value={printUrl} size={200} />
        <p className="mt-2 text-xs text-center break-all text-gray-700">{printUrl}</p>
      </div>
    </>
  );
}
