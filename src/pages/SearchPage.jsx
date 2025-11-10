// src/pages/SearchPage.jsx

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useFetchAllBooksQuery } from '../redux/features/books/booksApi';
import BookCard from './books/BookCard'; // Đảm bảo đường dẫn này chính xác
import Loading from '../components/Loading'; // Đảm bảo đường dẫn này chính xác

// Hàm trợ giúp để đọc query params từ URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchPage = () => {
  const query = useQuery();
  const searchQuery = query.get('q'); // Lấy tham số 'q' từ URL
  const { data: books = [], isLoading } = useFetchAllBooksQuery();
  const [filteredBooks, setFilteredBooks] = useState([]);

  useEffect(() => {
    // Lọc sách khi 'searchQuery' hoặc 'books' thay đổi
    if (searchQuery && books.length > 0) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      
      const results = books.filter(book =>
        (book.title && book.title.toLowerCase().includes(lowerCaseQuery)) ||
        (book.category && book.category.toLowerCase().includes(lowerCaseQuery)) ||
        (book.description && book.description.toLowerCase().includes(lowerCaseQuery))
      );
      
      setFilteredBooks(results);
    } else {
      setFilteredBooks([]); // Xóa kết quả nếu không có truy vấn
    }
  }, [searchQuery, books]); // Chạy lại khi các giá trị này thay đổi

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="py-10">
      <h2 className="text-3xl font-semibold mb-6">
        Kết quả tìm kiếm cho: <span className="text-primary">{searchQuery}</span>
      </h2>
      
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Hiển thị sách đã lọc bằng component BookCard hiện có */}
          {filteredBooks.map(book => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-lg">
          Không tìm thấy cuốn sách nào phù hợp với tìm kiếm của bạn.
        </p>
      )}
    </div>
  );
};

export default SearchPage;