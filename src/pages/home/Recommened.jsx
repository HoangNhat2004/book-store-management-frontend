import React, { useEffect, useState } from 'react'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// import required modules
import { Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import BookCard from '../books/BookCard';
import { useFetchAllBooksQuery } from '../../redux/features/books/booksApi';


const Recommened = () => {
   
    const {data: books = []} = useFetchAllBooksQuery();
    // (Giữ nguyên logic random)
    const [recommendedBooks, setRecommendedBooks] = useState([]);

    useEffect(() => {
        if (books.length > 0) {
            const nonTrendingBooks = books.filter(book => book.trending !== true);
            const shuffledBooks = [...nonTrendingBooks].sort(() => 0.5 - Math.random());
            setRecommendedBooks(shuffledBooks.slice(0, 10));
        }
    }, [books]); 


  return (
    <div className='py-16'>
         <h2 className='text-3xl font-semibold mb-6'>Recommended for you </h2>

         <Swiper
                slidesPerView={1}
                spaceBetween={30}
                navigation={true}
                // --- SỬA LẠI BREAKPOINTS CHO ĐỒNG BỘ ---
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
                // --- KẾT THÚC SỬA ---
                modules={[Pagination, Navigation]}
                className="mySwiper"
            >

                {
                   recommendedBooks.map((book, index) => (
                        // Xóa pb-4 để thẻ sách vừa vặn
                        <SwiperSlide key={index}>
                            <BookCard  book={book} />
                        </SwiperSlide>
                    ))
                }
            </Swiper>
    </div>
  )
}

export default Recommened