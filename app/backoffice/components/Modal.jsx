"use client";

import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

export default function Modal({ title, children, isOpen, onClose }) {
  const modalRef = useRef();

  // ปิดโมดัลด้วยปุ่ม Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && typeof onClose === "function") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // ป้องกันการเลื่อนหน้าจอเมื่อโมดัลเปิด
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  // ปิดโมดัลเมื่อคลิกนอกโมดัล
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      if (typeof onClose === "function") {
        onClose();
      } else {
        console.warn("onClose is not a function");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-50 transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all duration-300 scale-100 hover:scale-[1.02]"
      >
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        <div className="p-6 bg-gray-50">{children}</div>
      </div>
    </div>
  );
}

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};