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
    // 1. Thêm state để giữ sách đã xáo trộn
    const [recommendedBooks, setRecommendedBooks] = useState([]);

    // 2. Thêm useEffect để xử lý logic xáo trộn
    useEffect(() => {
        if (books.length > 0) {
            // Lọc ra những sách KHÔNG PHẢI "Top Seller" (trending: false)
            const nonTrendingBooks = books.filter(book => book.trending !== true);
            
            // Xáo trộn ngẫu nhiên danh sách đó
            const shuffledBooks = [...nonTrendingBooks].sort(() => 0.5 - Math.random());
            
            // Lấy 10 cuốn đầu tiên
            setRecommendedBooks(shuffledBooks.slice(0, 10));
        }
    }, [books]); // Chạy lại logic này mỗi khi 'books' được tải về


  return (
    <div className='py-16'>
         <h2 className='text-3xl font-semibold mb-6'>Recommended for you </h2>

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
                        spaceBetween: 40,
                    },
                    1024: {
                        slidesPerView: 2,
                        spaceBetween: 50,
                    },
                    1180: {
                        slidesPerView: 3,
                        spaceBetween: 50,
                    }
                }}
                modules={[Pagination, Navigation]}
                className="mySwiper"
            >

                {
                   // 3. Hiển thị danh sách đã xáo trộn
                   recommendedBooks.map((book, index) => (
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