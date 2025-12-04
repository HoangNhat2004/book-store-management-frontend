import React, { useState, useEffect } from 'react'
import BookCard from '../books/BookCard';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// import required modules
import { Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useFetchAllBooksQuery } from '../../redux/features/books/booksApi';
// 1. Import hook lấy danh mục
import { useFetchAllCategoriesQuery } from '../../redux/features/category/categoryApi';

const TopSellers = () => {
    const [selectedCategory, setSelectedCategory] = useState("Choose a genre");
    const {data: books = []} = useFetchAllBooksQuery();
    
    // 2. Lấy danh sách danh mục từ DB
    const { data: categoriesData = [] } = useFetchAllCategoriesQuery();
    
    // Tạo danh sách options cho select (Thêm option mặc định)
    const categoryOptions = ["Choose a genre", ...categoriesData.map(cat => cat.name)];

    // 3. Lọc sách Top Seller (trending)
    // (Chú ý: Nếu muốn hiện tất cả sách khi chọn genre thì bỏ .filter(trending) ở dưới)
    // Ở đây giữ nguyên logic cũ của bạn là lọc trên danh sách books gốc
    
    const filteredBooks = books.filter(book => {
        // 1. Điều kiện bắt buộc: Phải là sách Trending (Top Seller)
        if (book.trending !== true) return false;

        // 2. Điều kiện danh mục (nếu user chọn)
        if (selectedCategory === "Choose a genre") return true;
        
        const categoryName = book.category?.name || book.category || "";
        return categoryName.toLowerCase() === selectedCategory.toLowerCase();
    });

    return (
        <div className='py-16'>
            <div className='flex flex-col sm:flex-row justify-between items-center mb-8'>
                {/* Tiêu đề giữ nguyên */}
                <h2 className='text-4xl font-heading font-bold text-ink mb-4 sm:mb-0'>
                    Top Sellers
                    <div className='w-24 h-1 bg-accent mt-2'></div>
                </h2>
                
                {/* Dropdown - Đã cập nhật để dùng categoryOptions động */}
                <div className='mb-8 sm:mb-0 flex items-center'>
                    <select
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        name="category" id="category" 
                        className='border border-subtle bg-white rounded-md px-4 py-2 text-ink focus:outline-none focus:ring-1 focus:ring-accent'
                    >
                        {
                            categoryOptions.map((category, index) => (
                                <option key={index} value={category}>{category}</option>
                            ))
                        }
                    </select>
                </div>
            </div>

            <Swiper
                slidesPerView={1}
                spaceBetween={30}
                navigation={true}
                breakpoints={{
                    640: {
                        slidesPerView: 1,
                        spaceBetween: 20,
                    },
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 30,
                    },
                    1024: {
                        slidesPerView: 3,
                        spaceBetween: 30,
                    },
                    1180: {
                        slidesPerView: 4,
                        spaceBetween: 30,
                    }
                }}
                modules={[Pagination, Navigation]}
                className="mySwiper"
            >
                {
                   filteredBooks.length > 0 && filteredBooks.map((book, index) => (
                        <SwiperSlide key={index}>
                            <BookCard  book={book} />
                        </SwiperSlide>
                    ))
                }
            </Swiper>
        </div>
    )
}

export default TopSellers