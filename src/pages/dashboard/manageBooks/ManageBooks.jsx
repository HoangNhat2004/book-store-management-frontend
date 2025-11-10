import React, { useState, useEffect } from 'react' // 1. Import useState
import { useDeleteBookMutation, useFetchAllBooksQuery } from '../../../redux/features/books/booksApi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const ManageBooks = () => {
    const navigate = useNavigate();
    const { data: books, refetch } = useFetchAllBooksQuery()
    const [deleteBook] = useDeleteBookMutation()
    const query = useQuery();
    const urlSearchQuery = query.get('q');
    // 2. Thêm state để lưu trữ nội dung tìm kiếm
    const [searchQuery, setSearchQuery] = useState(urlSearchQuery || "");
    useEffect(() => {
        if (urlSearchQuery) {
            setSearchQuery(urlSearchQuery);
        }
    }, [urlSearchQuery]);

    const handleDeleteBook = async (id, title) => {
        Swal.fire({
            title: "Are you sure?",
            text: `You want to delete "${title}"? This action cannot be undone!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteBook(id).unwrap();
                    Swal.fire({
                        title: "Deleted!",
                        text: "Book has been deleted successfully.",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false
                    });
                    refetch();
                } catch (error) {
                    console.error('Failed to delete book:', error.message);
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to delete book. Please try again.",
                        icon: "error"
                    });
                }
            }
        });
    };

    const handleEditClick = (id) => {
        navigate(`dashboard/edit-book/${id}`);
    };

    // 3. Lọc danh sách sách dựa trên searchQuery
    const filteredBooks = books
        ? books.filter(book =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    return (
        <section className="py-1 bg-blueGray-50">
            <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4 mx-auto mt-24">
                <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded ">
                    <div className="rounded-t mb-0 px-4 py-3 border-0">
                        <div className="flex flex-wrap items-center">
                            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                                <h3 className="font-semibold text-base text-blueGray-700">All Books</h3>
                            </div>
                            {/* 4. Thêm ô input tìm kiếm */}
                            <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                                <input
                                    type="text"
                                    placeholder="Search by title or category..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="block w-full overflow-x-auto">
                        <table className="items-center bg-transparent w-full border-collapse ">
                            <thead>
                                <tr>
                                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                        #
                                    </th>
                                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                        Book Title
                                    </th>
                                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                        Category
                                    </th>
                                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                        Price
                                    </th>
                                    <th className="px-6 bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    // 5. Sử dụng 'filteredBooks' thay vì 'books' để render
                                    filteredBooks && filteredBooks.map((book, index) => (
                                        <tr key={index}>
                                            <th className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left text-blueGray-700 ">
                                                {index + 1}
                                            </th>
                                            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 ">
                                                {book.title}
                                            </td>
                                            <td className="border-t-0 px-6 align-center border-l-0 border-r-0 text-xs whitespace-nowBrap p-4">
                                                {book.category}
                                            </td>
                                            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                                                ${book.newPrice}
                                            </td>
                                            <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 space-x-4">
                                                <Link to={`/dashboard/edit-book/${book._id}`} className="font-medium text-indigo-600 hover:text-indigo-700 mr-2 hover:underline underline-offset-2">
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDeleteBook(book._id, book.title)}
                                                    className="font-medium bg-red-500 py-1 px-4 rounded-full text-white mr-2 hover:bg-red-600 transition-colors">
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