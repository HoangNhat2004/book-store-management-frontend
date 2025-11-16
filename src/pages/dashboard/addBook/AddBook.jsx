import React, { useState } from 'react'
import InputField from './InputField'
import SelectField from './SelectField'
import { useForm } from 'react-hook-form';
import { useAddBookMutation } from '../../../redux/features/books/booksApi';
import Swal from 'sweetalert2';

const AddBook = () => {
    // --- (LOGIC GIỮ NGUYÊN) ---
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [imageFile, setimageFile] = useState(null);
    const [addBook, {isLoading, isError}] = useAddBookMutation()
    const [imageFileName, setimageFileName] = useState('')
    const onSubmit = async (data) => {
        const newBookData = {
            ...data,
            coverImage: imageFileName,
            // Đảm bảo giá tiền là số
            oldPrice: Number(data.oldPrice),
            newPrice: Number(data.newPrice),
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
    // --- (KẾT THÚC LOGIC) ---

  return (
    // --- SỬA GIAO DIỆN ---
    <div className="max-w-2xl mx-auto md:p-8 p-4 bg-white rounded-lg shadow-sm border border-subtle">
      <h2 className="text-2xl font-heading font-bold text-ink mb-6">Add New Book</h2>

      <form onSubmit={handleSubmit(onSubmit)} className=''>
        <InputField
          label="Title"
          name="title"
          placeholder="Enter book title"
          register={register}
        />
        <InputField
          label="Author"
          name="author"
          placeholder="Enter author's name"
          register={register}
        />
        <InputField
          label="Description"
          name="description"
          placeholder="Enter book description"
          type="textarea"
          register={register}
        />
        <SelectField
          label="Category"
          name="category"
          options={[
            { value: '', label: 'Choose A Category' },
            { value: 'business', label: 'Business' },
            { value: 'technology', label: 'Technology' },
            { value: 'fiction', label: 'Fiction' },
            { value: 'horror', label: 'Horror' },
            { value: 'adventure', label: 'Adventure' },
          ]}
          register={register}
        />
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              {...register('trending')}
              className="rounded text-primary focus:ring-primary" // Sửa màu
            />
            <span className="ml-2 text-sm font-semibold text-ink">Trending</span>
          </label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
            label="Old Price"
            name="oldPrice"
            type="number"
            placeholder="Old Price"
            register={register}
            />
            <InputField
            label="New Price"
            name="newPrice"
            type="number"
            placeholder="New Price"
            register={register}
            />
        </div>

        {/* Sửa lại Input File */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-ink mb-1">Cover Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} 
            className="w-full text-sm text-ink
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-primary/10 file:text-primary
                       hover:file:bg-primary/20"
          />
          {imageFileName && <p className="text-sm text-gray-500 mt-2">Selected: {imageFileName}</p>}
        </div>

        {/* Sửa lại nút Submit */}
        <button type="submit" className="w-full py-3 btn-primary">
         {
            isLoading ? <span className="">Adding.. </span> : <span>Add Book</span>
          }
        </button>
      </form>
    </div>
    // --- KẾT THÚC SỬA GIAO DIỆN ---
  )
}

export default AddBook