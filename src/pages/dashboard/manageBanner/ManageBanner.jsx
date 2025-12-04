// src/pages/dashboard/manageBanner/ManageBanner.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { useFetchBannerQuery, useUpdateBannerMutation } from '../../../redux/features/banner/bannerApi';
import Swal from 'sweetalert2';
import Loading from '../../../components/Loading';

const ManageBanner = () => {
    const { data: banner, isLoading, refetch } = useFetchBannerQuery();
    const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
    
    const { register, handleSubmit, setValue } = useForm();
    const [imageFileName, setImageFileName] = useState(""); // Chỉ lưu tên file

    useEffect(() => {
        if (banner) {
            setValue('title', banner.title);
            setValue('description', banner.description);
            // Nếu banner.image là tên file (ví dụ "banner.png") thì hiện tên đó
            setImageFileName(banner.image || ""); 
        }
    }, [banner, setValue]);

    // --- XỬ LÝ GIỐNG ADD BOOK: CHỈ LẤY TÊN FILE ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFileName(file.name); // Chỉ lưu tên file, không upload
        }
    }
    // ----------------------------------------------

    const onSubmit = async (data) => {
        const bannerData = {
            ...data,
            image: imageFileName // Gửi tên file lên server (Ví dụ: "tet-2025.png")
        };

        try {
            await updateBanner(bannerData).unwrap();
            Swal.fire('Success', 'Banner updated successfully!', 'success');
            refetch();
        } catch (error) {
            Swal.fire('Error', 'Failed to update banner', 'error');
        }
    }

    if (isLoading) return <Loading />;

    return (
        <section className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto my-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Homepage Banner</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Banner Title</label>
                    <input 
                        {...register("title", { required: true })}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                        {...register("description", { required: true })}
                        className="w-full border border-gray-300 rounded px-3 py-2 h-24 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>

                {/* --- INPUT FILE GIỐNG ADD BOOK --- */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <input 
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100 cursor-pointer"
                            />
                            {imageFileName && (
                                <p className="text-sm text-green-600 mt-2 font-medium">
                                    Selected: {imageFileName}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                {/* -------------------------------- */}

                <button 
                    disabled={isUpdating}
                    className="w-full bg-primary text-white font-bold py-3 rounded hover:bg-opacity-90 disabled:opacity-50 transition"
                >
                    {isUpdating ? 'Updating...' : 'Update Banner'}
                </button>
            </form>
        </section>
    )
}

export default ManageBanner;