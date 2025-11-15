// src/pages/home/AllBooks.jsx
import React, { useState } from 'react'
import BookCard from '../books/BookCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useFetchAllBooksQuery } from '../../redux/features/books/booksApi';

// (Copy mảng categories từ TopSellers)
const categories = ["Choose a genre", "Business", "Fiction", "Horror", "Adventure"]

const AllBooks = () => {
    
    const [selectedCategory, setSelectedCategory] = useState("Choose a genre");
    const {data: books = []} = useFetchAllBooksQuery();
  
    // --- LOGIC LỌC TẤT CẢ SÁCH ---
    const filteredBooks = selectedCategory === "Choose a genre" 
        ? books // Nếu không chọn -> hiển thị TẤT CẢ SÁCH
        : books.filter(book => book.category === selectedCategory.toLowerCase()) // Nếu có chọn -> lọc
    
    return (
        <div className='py-10'>
            <h2 className='text-3xl font-semibold mb-6'>All Books</h2>
            {/* category filtering */}
            <div className='mb-8 flex items-center'>
                <select
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    name="category" id="category" className='border bg-[#EAEAEA] border-gray-300 rounded-md px-4 py-2 focus:outline-none'>
                    {
                        categories.map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                        ))
                    }
                </select>
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
                        spaceBetween: 30, // Sửa lại
                    },
                    1024: {
                        slidesPerView: 3, // Sửa lại
                        spaceBetween: 30,
                    },
                    1180: {
                        slidesPerView: 4, // Sửa lại
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

export default AllBooks