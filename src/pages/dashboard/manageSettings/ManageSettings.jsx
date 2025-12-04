import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useFetchSettingsQuery, useUpdateSettingsMutation } from '../../../redux/features/settings/settingsApi';
import Swal from 'sweetalert2';
import Loading from '../../../components/Loading';

const ManageSettings = () => {
    const { data: settings, isLoading, refetch } = useFetchSettingsQuery();
    const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();
    const { register, handleSubmit, setValue } = useForm();

    useEffect(() => {
        if (settings) {
            setValue('storeName', settings.storeName);
            setValue('email', settings.email);
            setValue('phone', settings.phone);
            setValue('address', settings.address);
        }
    }, [settings, setValue]);

    const onSubmit = async (data) => {
        try {
            await updateSettings(data).unwrap();
            Swal.fire('Success', 'Store settings updated successfully!', 'success');
            refetch();
        } catch (error) {
            Swal.fire('Error', 'Failed to update settings', 'error');
        }
    }

    if (isLoading) return <Loading />;

    return (
        <section className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto my-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Store Configuration</h2>
            <p className="text-sm text-gray-500 mb-6">Manage general information about your bookstore.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                    <input 
                        {...register("storeName", { required: true })}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="e.g. My Awesome Bookstore"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <input 
                        {...register("email", { required: true })}
                        type="email"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input 
                        {...register("phone", { required: true })}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
                    <textarea 
                        {...register("address", { required: true })}
                        className="w-full border border-gray-300 rounded px-3 py-2 h-24 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>

                <button 
                    disabled={isUpdating}
                    className="w-full bg-primary text-white font-bold py-3 rounded hover:bg-opacity-90 disabled:opacity-50 transition"
                >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </section>
    )
}

export default ManageSettings;