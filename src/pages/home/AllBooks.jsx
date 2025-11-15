// src/pages/home/AllBooks.jsx
import React from 'react'
import BookCard from '../books/BookCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useFetchAllBooksQuery } from '../../redux/features/books/booksApi';

// Đây là component "Full Sách" mới
const AllBooks = () => {
    
   const {data: books = []} = useFetchAllBooksQuery();
  
    return (
        <div className='py-16'>
            <h2 className='text-3xl font-semibold mb-6'>All Books</h2>
            {/* Không có bộ lọc thể loại ở đây, hiển thị tất cả */}
            
            <Swiper
                slidesPerView={1}
                spaceBetween={30}
                navigation={true}
                breakpoints={{
                    640: { slidesPerView: 1, spaceBetween: 20 },
                    768: { slidesPerView: 2, spaceBetween: 40 },
                    1024: { slidesPerView: 2, spaceBetween: 50 },
                    1180: { slidesPerView: 3, spaceBetween: 50 }
                }}
                modules={[Pagination, Navigation]}
                className="mySwiper"
            >
                {
                   // Lấy tất cả sách (không lọc trending)
                   books.length > 0 && books.map((book, index) => (
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