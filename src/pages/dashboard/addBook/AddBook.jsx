import React, { useState } from 'react'
import InputField from './InputField'
import SelectField from './SelectField' // Bạn có thể bỏ component này nếu muốn dùng select thường
import { useForm } from 'react-hook-form';
import { useAddBookMutation } from '../../../redux/features/books/booksApi';
// Import hook lấy danh mục
import { useFetchAllCategoriesQuery } from '../../../redux/features/category/categoryApi';
import Swal from 'sweetalert2';

const AddBook = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [imageFile, setimageFile] = useState(null);
    const [addBook, {isLoading, isError}] = useAddBookMutation();
    const [imageFileName, setimageFileName] = useState('');
    
    // Lấy danh sách Category từ DB
    const { data: categories = [] } = useFetchAllCategoriesQuery();

    const onSubmit = async (data) => {
        const newBookData = {
            ...data,
            coverImage: imageFileName,
            oldPrice: Number(data.oldPrice),
            newPrice: Number(data.newPrice),
            stock: Number(data.stock), // Đảm bảo có stock
            // Category giờ sẽ là ID (do value của select là _id)
        }
        try {
            await addBook(newBookData).unwrap();
            Swal.fire({ title: "Book added", text: "Your book is uploaded successfully!", icon: "success" });
              reset();
              setimageFileName('')
              setimageFile(null);
        } catch (error) {
            console.error(error);
            alert("Failed to add book. Please try again.")   
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if(file) {
            setimageFile(file);
            setimageFileName(file.name);
        }
    }

  return (
    <div className="max-w-2xl mx-auto md:p-8 p-4 bg-white rounded-lg shadow-sm border border-subtle">
      <h2 className="text-2xl font-heading font-bold text-ink mb-6">Add New Book</h2>

      <form onSubmit={handleSubmit(onSubmit)} className=''>
        <InputField label="Title" name="title" placeholder="Enter book title" register={register} />
        <InputField label="Author" name="author" placeholder="Enter author's name" register={register} />
        <InputField label="Description" name="description" placeholder="Enter book description" type="textarea" register={register} />
        
        {/* --- SELECT CATEGORY ĐỘNG --- */}
        <div className="mb-4">
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
        {/* --------------------------- */}

        <div className="mb-4">
          <label className="inline-flex items-center">
            <input type="checkbox" {...register('trending')} className="rounded text-primary focus:ring-primary" />
            <span className="ml-2 text-sm font-semibold text-ink">Trending</span>
          </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Old Price" name="oldPrice" type="number" placeholder="Old Price" register={register} />
            <InputField label="New Price" name="newPrice" type="number" placeholder="New Price" register={register} />
            <InputField label="Stock (Inventory)" name="stock" type="number" placeholder="Quantity in stock" register={register} />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-ink mb-1">Cover Image (File Name)</label>
          <input type="file" accept="image/*" onChange={handleFileChange} 
            className="w-full text-sm text-ink file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
          {imageFileName && <p className="text-sm text-gray-500 mt-2">Selected: {imageFileName}</p>}
        </div>

        <button type="submit" className="w-full py-3 btn-primary">
         {isLoading ? <span className="">Adding.. </span> : <span>Add Book</span>}
        </button>
      </form>
    </div>
  )
}

export default AddBook