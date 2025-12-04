import React from 'react';
import { useFetchAllCategoriesQuery, useAddCategoryMutation, useDeleteCategoryMutation } from '../../../redux/features/category/categoryApi';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { HiTrash } from "react-icons/hi";

const ManageCategory = () => {
    const { data: categories = [], isLoading } = useFetchAllCategoriesQuery();
    const [addCategory] = useAddCategoryMutation();
    const [deleteCategory] = useDeleteCategoryMutation();
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = async (data) => {
        try {
            await addCategory(data).unwrap();
            Swal.fire('Success', 'Category added!', 'success');
            reset();
        } catch (error) {
            Swal.fire('Error', 'Failed to add category', 'error');
        }
    }

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning',
            showCancelButton: true, confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteCategory(id).unwrap();
                    Swal.fire('Deleted!', 'Category has been deleted.', 'success');
                } catch (error) {
                    Swal.fire('Error', 'Failed to delete.', 'error');
                }
            }
        })
    }

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Categories</h2>

            {/* Form Thêm Category */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4 mb-8">
                <input 
                    {...register("name", { required: true })}
                    placeholder="New Category Name (e.g. Fiction)"
                    className="flex-1 border border-gray-300 rounded px-4 py-2"
                />
                <button className="bg-primary text-white px-6 py-2 rounded hover:bg-opacity-90">Add</button>
            </form>

            {/* Danh sách Category */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-gray-600">Name</th>
                            <th className="px-6 py-3 text-gray-600 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat._id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{cat.name}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(cat._id)} className="text-red-500 hover:text-red-700">
                                        <HiTrash className="size-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ManageCategory;