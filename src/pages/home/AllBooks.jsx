// src/pages/home/AllBooks.jsx
import React, { useState } from 'react'
import BookCard from '../books/BookCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useFetchAllBooksQuery } from '../../redux/features/books/booksApi';
// Import hook lấy danh mục từ API
import { useFetchAllCategoriesQuery } from '../../redux/features/category/categoryApi';

const AllBooks = () => {
    const [selectedCategory, setSelectedCategory] = useState("Choose a genre");
    
    // Gọi API lấy Sách và Danh mục
    const { data: books = [] } = useFetchAllBooksQuery();
    const { data: categoriesData = [] } = useFetchAllCategoriesQuery();

    // Tạo danh sách options cho dropdown (Động)
    const categoryOptions = ["Choose a genre", ...categoriesData.map(cat => cat.name)];

    // Logic lọc sách (Hỗ trợ cả sách cũ string và sách mới object)
    const filteredBooks = selectedCategory === "Choose a genre" 
        ? books 
        : books.filter(book => {
            const categoryName = book.category?.name || book.category || "";
            return categoryName.toLowerCase() === selectedCategory.toLowerCase();
        });

    return (
        <div className='py-16'>
            <div className='flex flex-col sm:flex-row justify-between items-center mb-8'>
                 <h2 className='text-3xl font-semibold mb-6'>All Books</h2>
                
                <div className='mb-8 flex items-center'>
                    <select
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        name="category" id="category" 
                        className='border bg-[#EAEAEA] border-gray-300 rounded-md px-4 py-2 focus:outline-none'
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

export default AllBooks