import React from 'react'
import footerLogo  from "../assets/footer-logo.png"
import { FaFacebook, FaInstagram, FaTwitter, FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa"
// Import hook lấy settings
import { useFetchSettingsQuery } from '../redux/features/settings/settingsApi';

const Footer = () => {
  // Gọi API lấy thông tin cấu hình cửa hàng
  const { data: settings, isLoading } = useFetchSettingsQuery();

  return (
    <footer className="bg-primary text-white py-10 px-4">
      {/* Top Section */}
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
        
        {/* Left Side - Logo and Contact Info */}
        <div className="md:w-1/2 w-full">
          <img src={footerLogo} alt="Logo" className="mb-5 w-36" />
          
          {/* Hiển thị thông tin động từ Admin Settings */}
          <div className="flex flex-col gap-2 mb-4">
              {isLoading ? (
                  <p>Loading store info...</p>
              ) : (
                  <>
                      {/* Hiển thị Địa chỉ */}
                      <p className="flex items-start gap-2">
                          <FaMapMarkerAlt className="mt-1" />
                          {settings?.address || "123 Book Street, Ho Chi Minh City"}
                      </p>
                      
                      {/* Hiển thị Số điện thoại */}
                      <p className="flex items-center gap-2">
                          <FaPhone />
                          {settings?.phone || "+84 123 456 789"}
                      </p>

                      {/* Hiển thị Email */}
                      <p className="flex items-center gap-2">
                          <FaEnvelope />
                          {settings?.email || "support@bookstore.com"}
                      </p>
                  </>
              )}
          </div>

          <ul className="flex flex-col md:flex-row gap-4">
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
              className="w-full px-4 py-2 rounded-l-md text-ink focus:outline-none"
            />
            <button className="bg-accent px-6 py-2 rounded-r-md hover:bg-opacity-90 text-white font-semibold transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center mt-10 border-t border-white/20 pt-6">
        <ul className="flex gap-6 mb-4 md:mb-0">
          <li><a href="#privacy" className="hover:text-accent-light">Privacy Policy</a></li>
          <li><a href="#terms" className="hover:text-accent-light">Terms of Service</a></li>
        </ul>
        
        {/* Social Icons */}
        <div className="flex gap-6">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent-light transition-colors">
            <FaFacebook size={24} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent-light transition-colors">
            <FaTwitter size={24} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent-light transition-colors">
            <FaInstagram size={24} />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer