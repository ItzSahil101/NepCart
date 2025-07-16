import React from "react";
import {
  FaArrowRight,
  FaLinkedinIn,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaFacebook,
  FaTiktok,
} from "react-icons/fa";

export default function Footer() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {/* Top Section */}
      <div className="flex items-center justify-between px-10 py-20 bg-white flex-grow">
        <div className="text-left">
          <h2 className="uppercase tracking-widest text-sm text-gray-700">
            Heard Enough?
          </h2>
          <h1 className="text-5xl font-semibold mt-2">Contact us</h1>
        </div>
        <button className="bg-[#FF7F11] text-white rounded-full w-14 h-14 flex items-center justify-center hover:scale-105 duration-200">
          <FaArrowRight className="text-lg" />
        </button>
      </div>

      {/* Horizontal Line */}
      <div className="w-full border-t border-gray-300" />

      {/* Footer Section */}
      <footer className="bg-[#0D1B2A] text-white px-10 py-14">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Left Column */}
          <div>
            <p className="font-bold text-xl leading-6 text-[#FF7F11]">
              The agency of
              <br />
              NepCart
              <br />
              top_xd®
            </p>
          </div>

          {/* London Office */}
          <div>
            <p className="uppercase text-sm font-semibold text-[#FF7F11]">
              Our Team
            </p>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              <code>Manager: <b>Sahil Jogi</b></code>
              <br />
              <code>Delivery Incharge: <b>Amit katuwal</b></code>
              <br />
             <code>AD incharge: <b>Sapan Jogi</b></code>
              <br />
              <code>Product Incharge: <b>Quson Rai</b></code>
              <br />
               <code>Investor: <b>Himal Timsina</b></code>
            </p>
            {/* <button className="mt-4 border-b border-[#FF7F11] text-sm hover:opacity-70 text-[#FF7F11]">
              SEE CONTACT
            </button> */}
          </div>

          {/* Europe Office */}
          <div>
            <p className="uppercase text-sm font-semibold text-[#FF7F11]">
              Contact: 
            </p>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              <b>NepCart official store</b>
              <br />
                9812398463
              <br />
              Kanepokhari-7, Morang
              <br />
              example@gmail.com
            </p>
            {/* <button className="mt-4 border-b border-[#FF7F11] text-sm hover:opacity-70 text-[#FF7F11]">
              SEE CONTACT
            </button> */}
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="uppercase text-sm font-semibold text-[#FF7F11]">
                Want to buy customize tshirt?
              </p>
              <p className="mt-2 text-sm leading-6 underline underline-offset-2 text-[#FF7F11]">
                check /custom page of our site
              </p>
            </div>
            <div className="flex gap-3 text-white mt-3">
             <a href="https://www.facebook.com/profile.php?id=61576855823327"> <FaFacebook  className="hover:text-[#FF7F11] cursor-pointer" /> </a>
             <a><FaInstagram className="hover:text-[#FF7F11] cursor-pointer" /> </a>
               <a> <FaTiktok className="hover:text-[#FF7F11] cursor-pointer" /> </a>
            </div>
            <div>
              <p className="uppercase text-sm mt-4 text-gray-400">FULLGUIDE</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
