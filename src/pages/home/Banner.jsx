import React from 'react'

import bannerImg from "../../assets/banner.png"

const Banner = () => {
  return (
    <div className='flex flex-col md:flex-row-reverse py-16 justify-between items-center gap-12'>
         <div className='md:w-1/2 w-full flex items-center md:justify-end'>
            <img src={bannerImg} alt="" />
        </div>
        
        <div className='md:w-1/2 w-full'>
            {/* Sửa font chữ */}
            <h1 className='md:text-5xl text-4xl font-heading font-bold text-primary mb-7'>New Releases This Week</h1>
            <p className='mb-10 text-lg text-ink/80'> {/* Sửa font chữ */}
              It's time to update your reading list...
            </p>
        </div>
    </div>
  )
}

export default Banner