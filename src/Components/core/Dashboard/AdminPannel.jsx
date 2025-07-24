import React, { useEffect, useState } from 'react'
import { createCategory, deleteCategory } from '../../../services/operations/courseDetailsAPI';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { categories } from '../../../services/apis';
import { apiConnector } from '../../../services/apiConnector';

const AdminPannel = () => {
    const { token } = useSelector((state) => state.auth);
    const [category, setCategory] = React.useState({
        name: '',
        description: ''
    });
    const [allCategories, setAllCategories] = useState([]);

    const fetchCategories = async () => {
        try {
            const response = await apiConnector("GET", categories.CATEGORIES_API);
            if (response?.data?.success) {
                setAllCategories(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!category.name || !category.description) {
            toast.error("Please fill in both fields.");
            return;
        }

        try {
            // API Call
            const res = await createCategory(
                {
                    name: category.name,
                    description: category.description
                },
                token
            );

            // If success
            if (res) {
                toast.success("Category created successfully!");
                setCategory({ name: '', description: '' }); // Clear form
                fetchCategories(); // Refresh categories list
            }
        } catch (err) {
            toast.error("Failed to create category.");
            console.error(err);
        }
    }

    const handleDelete = async (categoryId) => {
        try {
            const res = await deleteCategory({ categoryId }, token);
            if (res) {
                fetchCategories(); // Refresh categories list
            }
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className='text-pure-greys-50 text-xl p-5'>
            <form onSubmit={handleSubmit}>
                <div className='flex flex-col gap-2'>
                    <label htmlFor="category">Category Name</label>
                    <input
                        value={category.name}
                        onChange={(e) => setCategory({ ...category, name: e.target.value })}
                        type="text"
                        name="category"
                        id="category"
                        className="form-style"
                        placeholder='Enter category name'
                    />
                </div>

                <div className='flex flex-col gap-2 mt-10'>
                    <label htmlFor="description">Category Description</label>
                    <textarea
                        value={category.description}
                        onChange={(e) => setCategory({ ...category, description: e.target.value })}
                        name="description"
                        id="description"
                        className="form-style"
                        placeholder='Enter category description'
                    />
                </div>

                <button
                    type="submit"
                    className="mt-10 rounded-md bg-yellow-50 px-6 py-3 text-center text-[13px] font-bold text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] transition-all duration-200 hover:scale-95 hover:shadow-none disabled:bg-richblack-500 sm:text-[16px]"
                >
                    Create
                </button>
            </form>

            {/* Categories List */}
            <div className="mt-10">
                <h2 className="text-2xl font-bold mb-5">Existing Categories</h2>
                <div className="space-y-4">
                    {allCategories.map((cat) => (
                        <div key={cat._id} className="flex justify-between items-center bg-richblack-800 p-4 rounded-lg">
                            <div>
                                <h3 className="text-xl font-semibold">{cat.name}</h3>
                                <p className="text-richblack-300">{cat.description}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(cat._id)}
                                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-all duration-200"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AdminPannel;
