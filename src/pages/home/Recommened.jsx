import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import BookCard from '../books/BookCard';
import { useFetchAllBooksQuery } from '../../redux/features/books/booksApi';


const Recommened = () => {
   
    const {data: books = []} = useFetchAllBooksQuery();
  return (
    // --- SỬA GIAO DIỆN ---
    <div className='py-16'>
         <h2 className='text-4xl font-heading font-bold text-ink mb-8'>
            Recommended For You
            <div className='w-24 h-1 bg-accent mt-2'></div>
         </h2>

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
                {/* (BookCard đã được "lột xác" ở bước trước) */}
                {
                   books.length > 0 && books.slice(8, 18).map((book, index) => (
                        <SwiperSlide key={index}>
                            <BookCard  book={book} />
                        </SwiperSlide>
                    ))
                }
            </Swiper>
    </div>
    // --- KẾT THÚC SỬA GIAO DIỆN ---
  )
}

export default Recommened