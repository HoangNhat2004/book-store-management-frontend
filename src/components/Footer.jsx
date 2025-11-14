import React from 'react'
import footerLogo  from "../assets/footer-logo.png"

import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa"

const Footer = () => {
  return (
    // Sửa màu nền và màu chữ
    <footer className="bg-primary text-white py-10 px-4">
      {/* Top Section */}
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Left Side - Logo and Nav */}
        <div className="md:w-1/2 w-full">
          <img src={footerLogo} alt="Logo" className="mb-5 w-36" />
          <ul className="flex flex-col md:flex-row gap-4">
            {/* Sửa màu hover */}
            <li><a href="#home" className="hover:text-accent-light">Home</a></li>
            <li><a href="#services" className="hover:text-accent-light">Services</a></li>
            <li><a href="#about" className="hover:text-accent-light">About Us</a></li>
            <li><a href="#contact" className="hover:text-accent-light">Contact</a></li>
          </ul>
        </div>

        {/* Right Side - Newsletter */}
        <div className="md:w-1/2 w-full">
          <p className="mb-4 text-white/80">
            Subscribe to our newsletter to receive the latest updates, news, and offers!
          </p>
          <div className="flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-l-md text-ink" // Sửa màu chữ input
            />
            {/* Sửa màu nút */}
            <button className="bg-accent px-6 py-2 rounded-r-md hover:bg-opacity-90 text-white font-semibold">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* ... (Bottom Section - Sửa màu hover) ... */}
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center mt-10 border-t border-white/20 pt-6">
        <ul className="flex gap-6 mb-4 md:mb-0">
          <li><a href="#privacy" className="hover:text-accent-light">Privacy Policy</a></li>
          <li><a href="#terms" className="hover:text-accent-light">Terms of Service</a></li>
        </ul>
        <div className="flex gap-6">
          <a href="https...com" target="_blank" rel="noopener noreferrer" className="hover:text-accent-light">
            <FaFacebook size={24} />
          </a>
          <a href="https...com" target="_blank" rel="noopener noreferrer" className="hover:text-accent-light">
            <FaTwitter size={24} />
          </a>
          <a href="https...com" target="_blank" rel="noopener noreferrer" className="hover:text-accent-light">
            <FaInstagram size={24} />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer