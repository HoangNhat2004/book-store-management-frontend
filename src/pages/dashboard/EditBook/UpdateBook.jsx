import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from 'react-router-dom';
import { useFetchBookByIdQuery, useUpdateBookMutation, useFetchPriceHistoryQuery } from '../../../redux/features/books/booksApi';
import InputField from '../addBook/InputField';
// Import hook Category
import { useFetchAllCategoriesQuery } from '../../../redux/features/category/categoryApi';
import Swal from 'sweetalert2';
import Loading from '../../../components/Loading';

const UpdateBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: bookData, isLoading, isError, refetch } = useFetchBookByIdQuery(id);
  const { data: priceHistory = [], refetch: refetchHistory } = useFetchPriceHistoryQuery(id);
  const { data: categories = [] } = useFetchAllCategoriesQuery(); 

  const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  // --- 1. THÊM STATE LƯU TÊN ẢNH ---
  const [imageFileName, setImageFileName] = useState('');
  // --------------------------------

  useEffect(() => {
    if (bookData) {
      setValue('title', bookData.title);
      setValue('description', bookData.description);
      setValue('category', bookData?.category?._id || bookData?.category);
      setValue('trending', bookData.trending);
      setValue('oldPrice', bookData.oldPrice);
      setValue('newPrice', bookData.newPrice);
      
      // --- 2. SET GIÁ TRỊ ẢNH CŨ ---
      setValue('coverImage', bookData.coverImage);
      setImageFileName(bookData.coverImage); // Hiển thị tên ảnh cũ
      // ----------------------------
      
      setValue('stock', bookData.stock);
      setValue('author', bookData.author);
    }
  }, [bookData, setValue]);

  // --- 3. HÀM XỬ LÝ CHỌN FILE (Giống AddBook) ---
  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if(file) {
          setImageFileName(file.name);
      }
  }
  // ---------------------------------------------

  const onSubmit = async (data) => {
    const updateBookData = {
      title: data.title,
      description: data.description,
      category: data.category,
      trending: data.trending,
      oldPrice: Number(data.oldPrice),
      newPrice: Number(data.newPrice),
      // --- 4. GỬI TÊN FILE ẢNH ---
      coverImage: imageFileName, // Dùng state imageFileName thay vì data.coverImage
      // --------------------------
      stock: Number(data.stock),
      author: data.author,
      note: "Admin updated price" 
    };

    try {
      await updateBook({ id, ...updateBookData }).unwrap();
      
      Swal.fire({ 
          title: "Updated", text: "Book updated successfully!", icon: "success",
          timer: 1500, showConfirmButton: false 
      });

      await refetch();
      await refetchHistory(); 
      
    } catch (error) {
      console.error("Failed to update book", error);
      Swal.fire({ title: "Error", text: "Failed to update book", icon: "error" });
    }
  };

  if (isLoading) return <Loading />;
  if (isError) return <div>Error fetching book data</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Update Book</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <InputField label="Title" name="title" placeholder="Enter book title" register={register} />
        <InputField label="Author" name="author" placeholder="Enter author name" register={register} />
        <InputField label="Description" name="description" placeholder="Enter description" type="textarea" register={register} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                    {...register("category", { required: true })}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-gray-50"
                >
                    <option value="">Choose A Category</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" {...register('trending')} className="w-4 h-4 text-blue-600 rounded" />
                <label className="text-gray-700 font-semibold">Trending</label>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField label="Old Price" name="oldPrice" type="number" placeholder="Old Price" register={register} />
            <InputField label="New Price" name="newPrice" type="number" placeholder="New Price" register={register} />
            <InputField label="Stock" name="stock" type="number" placeholder="Stock" register={register} />
        </div>

        {/* --- 5. THAY INPUT TEXT BẰNG INPUT FILE --- */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {imageFileName && (
              <p className="text-sm text-green-600 mt-2">
                  Current/Selected Image: <strong>{imageFileName}</strong>
              </p>
          )}
        </div>
        {/* ----------------------------------------- */}

        <button type="submit" className="w-full bg-primary text-white font-bold py-2 rounded hover:bg-opacity-90">
          {isUpdating ? 'Updating...' : 'Update Book & View History'}
        </button>
      </form>

      <div className="mt-12 border-t pt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Price & Promotion History</h3>
        
        {priceHistory.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded text-gray-500 text-center border border-dashed border-gray-300">
                No price history available yet. Try changing the "New Price" and update.
            </div>
        ) : (
            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase font-semibold">
                        <tr>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">Old Price</th>
                            <th className="px-4 py-3">New Price (Sale)</th>
                            <th className="px-4 py-3">Changed By</th>
                            <th className="px-4 py-3">Note</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {priceHistory.map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50 transition">
                                <td className="px-4 py-3 text-gray-700">
                                    {new Date(item.createdAt).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-gray-500 line-through">
                                    ${item.oldPrice}
                                </td>
                                <td className="px-4 py-3 font-bold text-green-600">
                                    ${item.newPrice}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {item.updatedBy?.username || item.updatedBy?.email || 'Admin'}
                                </td>
                                <td className="px-4 py-3 text-gray-500 italic">
                                    {item.note}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default UpdateBook;