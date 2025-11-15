import React, { useState } from 'react'
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

const categories = ["Choose a genre", "Business", "Fiction", "Horror", "Adventure"]

const TopSellers = () => {
    // --- (LOGIC GIỮ NGUYÊN) ---
    const [selectedCategory, setSelectedCategory] = useState("Choose a genre");
    const {data: books = []} = useFetchAllBooksQuery();
    // 1. Lọc ra những sách "Top Seller" (trending) trước
    const topSellingBooks = books.filter(book => book.trending === true);

    // 2. Lọc theo thể loại (category) DỰA TRÊN danh sách topSellingBooks
    const filteredBooks = selectedCategory === "Choose a genre" 
        ? topSellingBooks // Nếu không chọn -> hiển thị tất cả sách trending
        : topSellingBooks.filter(book => book.category === selectedCategory.toLowerCase()) // Nếu có chọn -> lọc tiếp
    // --- (KẾT THÚC LOGIC) ---

    return (
        // --- BẮT ĐẦU SỬA GIAO DIỆN ---
        <div className='py-16'>
            <div className='flex flex-col sm:flex-row justify-between items-center mb-8'>
                {/* Sửa Tiêu đề */}
                <h2 className='text-4xl font-heading font-bold text-ink mb-4 sm:mb-0'>
                    Top Sellers
                    {/* Thêm gạch chân cách điệu */}
                    <div className='w-24 h-1 bg-accent mt-2'></div>
                </h2>
                
                {/* Sửa Dropdown */}
                <div className='mb-8 sm:mb-0 flex items-center'>
                    <select
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        name="category" id="category" 
                        className='border border-subtle bg-white rounded-md px-4 py-2 text-ink focus:outline-none focus:ring-1 focus:ring-accent'
                    >
                        {
                            categories.map((category, index) => (
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
                        spaceBetween: 30, // Tăng khoảng cách
                    },
                    1024: {
                        slidesPerView: 3, // Hiển thị 3
                        spaceBetween: 30,
                    },
                    1180: {
                        slidesPerView: 4, // Hiển thị 4
                        spaceBetween: 30,
                    }
                }}
                modules={[Pagination, Navigation]}
                className="mySwiper"
            >
                {/* (BookCard đã được "lột xác" ở bước trước) */}
                {
                   filteredBooks.length > 0 && filteredBooks.map((book, index) => (
                        <SwiperSlide key={index} className="pb-4">
                            <BookCard  book={book} />
                        </SwiperSlide>
                    ))
                }
            </Swiper>
        </div>
        // --- KẾT THÚC SỬA GIAO DIỆN ---
    )
}

export default TopSellers