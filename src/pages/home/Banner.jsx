import React from 'react'
import bannerImg from "../../assets/banner.png"
import { useFetchBannerQuery } from '../../redux/features/banner/bannerApi';

// Hàm lấy URL ảnh từ thư mục assets
const getBannerUrl = (name) => {
    if (!name) return bannerImg;
    try {
        return new URL(`../../assets/${name}`, import.meta.url).href;
    } catch (error) {
        return bannerImg;
    }
}

const Banner = () => {
    const { data: banner, isLoading } = useFetchBannerQuery();

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className='flex flex-col md:flex-row-reverse py-16 justify-between items-center gap-12'>
             {/* Container chứa ảnh */}
             <div className='md:w-1/2 w-full flex items-center md:justify-center'>
                <img 
                    src={getBannerUrl(banner?.image)} 
                    alt="Banner" 
                    // Class giúp ảnh nhỏ lại trên Desktop (md:w-3/4)
                    className="w-full md:w-3/4 h-auto rounded-md shadow-sm object-cover"
                />
            </div>
            
            {/* Container chứa chữ */}
            <div className='md:w-1/2 w-full'>
                <h1 className='md:text-5xl text-2xl font-medium mb-7'>
                    {banner?.title || "New Releases This Week"}
                </h1>
                <p className='mb-10'>
                    {banner?.description || "It's time to update your reading list..."}
                </p>
                
                {/* ĐÃ XÓA NÚT SUBSCRIBE TẠI ĐÂY */}
                
            </div>
        </div>
    )
}

export default Banner