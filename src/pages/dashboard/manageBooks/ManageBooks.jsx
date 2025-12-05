import React, { useState, useEffect } from 'react'
import { useDeleteBookMutation, useFetchAllBooksQuery } from '../../../redux/features/books/booksApi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

// Hàm helper để đọc query params
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const ManageBooks = () => {
    const navigate = useNavigate();
    const { data: books, refetch } = useFetchAllBooksQuery()
    const [deleteBook] = useDeleteBookMutation()
    
    const query = useQuery();
    const urlSearchQuery = query.get('q');
    const [searchQuery, setSearchQuery] = useState(urlSearchQuery || "");
    
    useEffect(() => { // Sync URL query to state
        if (urlSearchQuery) { setSearchQuery(urlSearchQuery); }
    }, [urlSearchQuery]);

    const handleDeleteBook = async (id, title) => {
        Swal.fire({
            title: "Are you sure?",
            text: `You want to delete "${title}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#E07A5F", 
            cancelButtonColor: "#33312E",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteBook(id).unwrap();
                    Swal.fire({ title: "Deleted!", text: "Book has been deleted.", icon: "success" });
                    refetch();
                } catch (error) {
                    Swal.fire({ title: "Error!", text: "Failed to delete book.", icon: "error" });
                }
            }
        });
    };
    
    // LOGIC LỌC SÁCH: Thêm cả stock vào để tiện debug nếu cần
    const filteredBooks = books
        ? books.filter(book => {
            // Lấy tên Category an toàn (dù là object hay string)
            const categoryName = book.category?.name || book.category || "";
            
            return (
                (book.title && book.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (categoryName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        })
        : [];

    return (
        <section className="py-1 bg-paper">
            <div className="w-full mb-12 xl:mb-0 px-4 mx-auto">
                <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-sm border border-subtle rounded-lg ">
                    <div className="rounded-t mb-0 px-4 py-3 border-b border-subtle">
                        <div className="flex flex-wrap items-center">
                            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                                <h3 className="font-heading font-semibold text-base text-ink">All Books</h3>
                            </div>
                            <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                                <input
                                    type="text"
                                    placeholder="Search by title, category, or author..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border border-subtle rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="block w-full overflow-x-auto">
                        <table className="items-center bg-transparent w-full border-collapse ">
                            <thead>
                                <tr>
                                    <th className="px-6 bg-paper text-ink align-middle border border-subtle py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                        #
                                    </th>
                                    <th className="px-6 bg-paper text-ink align-middle border border-subtle py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                        Book Title
                                    </th>
                                    <th className="px-6 bg-paper text-ink align-middle border border-subtle py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                        Author
                                    </th>
                                    <th className="px-6 bg-paper text-ink align-middle border border-subtle py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                        Category
                                    </th>
                                    <th className="px-6 bg-paper text-ink align-middle border border-subtle py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                        Price
                                    </th>
                                    
                                    {/* --- 1. CỘT STOCK --- */}
                                    <th className="px-6 bg-paper text-ink align-middle border border-subtle py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                        Stock
                                    </th>
                                    {/* ------------------- */}

                                    <th className="px-6 bg-paper text-ink align-middle border border-subtle py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    filteredBooks && filteredBooks.map((book, index) => (
                                        <tr key={index} className="hover:bg-paper/60 transition-colors">
                                            <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left text-ink ">
                                                {index + 1}
                                            </th>
                                            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 font-medium">
                                                {book.title}
                                            </td>
                                            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                                                {book.author || 'N/A'}
                                            </td>
                                            <td className="border-t-0 px-6 align-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4 capitalize">
                                                {book.category?.name || book.category || 'Uncategorized'}
                                            </td>
                                            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                                                ${book.newPrice}
                                            </td>
                                            
                                            {/* --- 2. DỮ LIỆU STOCK --- */}
                                            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                    (book.stock || 0) > 0 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {book.stock || 0}
                                                </span>
                                            </td>
                                            {/* ------------------------ */}

                                            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 space-x-4">
                                                <Link to={`/dashboard/edit-book/${book._id}`} className="font-medium text-primary hover:text-opacity-80">
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteBook(book._id, book.title)}
                                                    className="font-medium text-accent hover:text-opacity-80">
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ManageBooks