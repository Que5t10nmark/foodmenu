"use client";

import PropTypes from "prop-types";

export default function Modal({ title, children, isOpen, onClose }) {
  return (
    isOpen && (
      <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-lg">
          <h2>
            {title}
            <button className="float-right text-gray-300" onClick={onClose}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </h2>
          <div className="mt-4 p-5">{children}</div>
        </div>
      </div>
    )
  );
}

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
