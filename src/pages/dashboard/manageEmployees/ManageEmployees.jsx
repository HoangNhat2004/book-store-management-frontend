import React, { useState, useEffect } from 'react';
import { useFetchEmployeesQuery, useAddEmployeeMutation, useDeleteUserMutation, useUpdateEmployeeMutation } from '../../../redux/features/users/usersApi';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { HiTrash, HiUserAdd, HiPencilAlt } from "react-icons/hi"; // Thêm icon Pencil

const ManageEmployees = () => {
    const { data: employees = [], isLoading } = useFetchEmployeesQuery();
    const [addEmployee] = useAddEmployeeMutation();
    const [deleteUser] = useDeleteUserMutation();
    const [updateEmployee] = useUpdateEmployeeMutation(); // Hook update
    
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false); // Check xem đang thêm hay sửa
    const [selectedId, setSelectedId] = useState(null); // Lưu ID nhân viên đang sửa

    // Mở modal thêm mới
    const handleOpenAddModal = () => {
        setEditMode(false);
        setSelectedId(null);
        reset({ username: "", email: "", password: "" }); // Reset form
        setIsModalOpen(true);
    }

    // Mở modal sửa
    const handleOpenEditModal = (emp) => {
        setEditMode(true);
        setSelectedId(emp._id);
        // Fill dữ liệu cũ vào form
        setValue("username", emp.username);
        setValue("email", emp.email);
        setValue("password", ""); // Để trống pass, nhập mới thì đổi, không thì thôi
        setIsModalOpen(true);
    }

    // Xử lý Submit (Chung cho cả Add và Edit)
    const onSubmit = async (data) => {
        try {
            if (editMode) {
                // --- LOGIC SỬA ---
                // Nếu không nhập pass thì xóa field pass đi để backend không hash chuỗi rỗng
                const updateData = { ...data };
                if (!updateData.password) delete updateData.password;

                await updateEmployee({ id: selectedId, ...updateData }).unwrap();
                Swal.fire('Updated!', 'Employee information updated.', 'success');
            } else {
                // --- LOGIC THÊM ---
                await addEmployee(data).unwrap();
                Swal.fire('Created!', 'New staff member added.', 'success');
            }
            setIsModalOpen(false);
            reset();
        } catch (error) {
            console.error(error);
            Swal.fire('Error!', 'Operation failed.', 'error');
        }
    };

    const handleDelete = (id, name) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Remove ${name} from staff?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteUser(id).unwrap();
                    Swal.fire('Deleted!', 'Employee removed.', 'success');
                } catch (error) {
                    Swal.fire('Error!', 'Failed to delete.', 'error');
                }
            }
        });
    };

    if (isLoading) return <div className="p-4">Loading staff data...</div>;

    return (
        <section className="bg-paper min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-heading font-bold text-ink">Manage Employees</h2>
                <button 
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition shadow-sm"
                >
                    <HiUserAdd className="w-5 h-5" />
                    Add New Employee
                </button>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-subtle">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50 border-b border-subtle">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600">#</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Username</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Email</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Role</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-subtle">
                        {employees.map((emp, index) => (
                            <tr key={emp._id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                                <td className="px-6 py-4 font-medium text-ink">{emp.username}</td>
                                <td className="px-6 py-4 text-gray-500">{emp.email}</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                                        {emp.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                    {/* Nút Sửa */}
                                    <button 
                                        onClick={() => handleOpenEditModal(emp)}
                                        className="text-blue-500 hover:text-blue-700 transition p-2 rounded-full hover:bg-blue-50"
                                        title="Edit"
                                    >
                                        <HiPencilAlt className="w-5 h-5" />
                                    </button>
                                    {/* Nút Xóa */}
                                    <button 
                                        onClick={() => handleDelete(emp._id, emp.username)}
                                        className="text-red-500 hover:text-red-700 transition p-2 rounded-full hover:bg-red-50"
                                        title="Delete"
                                    >
                                        <HiTrash className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Form (Dùng chung cho Add và Edit) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >✕</button>
                        
                        <h3 className="text-xl font-bold mb-4 text-ink">
                            {editMode ? "Edit Employee" : "Add New Employee"}
                        </h3>
                        
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input 
                                    {...register("username", { required: true })}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input 
                                    {...register("email", { required: true })}
                                    type="email"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password {editMode && <span className="text-xs text-gray-500 font-normal">(Leave blank to keep current)</span>}
                                </label>
                                <input 
                                    {...register("password", { required: !editMode })} // Bắt buộc nếu là Add, không bắt buộc nếu là Edit
                                    type="password"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-primary focus:outline-none"
                                    placeholder={editMode ? "••••••" : ""}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90">
                                    {editMode ? "Save Changes" : "Create Employee"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ManageEmployees;