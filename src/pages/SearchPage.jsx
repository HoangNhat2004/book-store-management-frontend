import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useFetchAllBooksQuery } from '../redux/features/books/booksApi';
import BookCard from './books/BookCard'; // (BookCard đã được "lột xác")
import Loading from '../components/Loading'; 

// Hàm helper để đọc query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchPage = () => {
  // --- (LOGIC GIỮ NGUYÊN) ---
  const query = useQuery();
  const searchQuery = query.get('q'); 
  const { data: books = [], isLoading } = useFetchAllBooksQuery();
  const [filteredBooks, setFilteredBooks] = useState([]);
  useEffect(() => {
    if (searchQuery && books.length > 0) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const results = books.filter(book =>
        (book.title && book.title.toLowerCase().includes(lowerCaseQuery)) ||
        (book.category && book.category.toLowerCase().includes(lowerCaseQuery)) ||
        (book.description && book.description.toLowerCase().includes(lowerCaseQuery))
      );
      setFilteredBooks(results);
    } else {
      setFilteredBooks([]);
    }
  }, [searchQuery, books]); 
  // --- (KẾT THÚC LOGIC) ---


  if (isLoading) {
    return <Loading />;
  }

  return (
    // --- SỬA GIAO DIỆN ---
    <div className="py-10 max-w-screen-xl mx-auto">
      <h2 className="text-3xl font-heading font-bold text-ink mb-8">
        Search Results for: <span className="text-accent">{searchQuery}</span>
      </h2>
      
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* (Render BookCard đã được "lột xác") */}
          {filteredBooks.map(book => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      ) : (
        // Sửa giao diện "Không tìm thấy"
        <div className="text-center py-16 text-gray-500 bg-white border border-subtle rounded-lg shadow-sm">
            <p className="text-xl font-heading">No books found matching your search.</p>
            <p className="mt-2">Try searching for a different keyword or category.</p>
        </div>
      )}
    </div>
    // --- KẾT THÚC SỬA GIAO DIỆN ---
  );
};

export default SearchPage;