import { useEffect, useState } from "react";
import apiClient from "@/services/apiClient"; 
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table"; 
import { Button } from "../ui/button";
import { Link } from "react-router-dom"; 
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription,ToastClose } from "@/components/ui/toast"; // Assuming you have a Toast component

const AllCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);


  const fetchCategories = async () => {
    try {
      const { data } = await apiClient.get("/categories");
   
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const deleteCategory = async () => {

    const token = localStorage.getItem("token");

    try {
      await apiClient.delete(`/categories/${categoryToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchCategories();
      setIsModalOpen(false);
      setToastMessage("Category deleted successfully!");
      setIsToastVisible(true);
    } catch (error) {
      console.error("Error deleting category:", error.response ? error.response.data : error.message);
    }
  };

  // Modal handling
  const openModal = (id) => {
    setCategoryToDelete(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCategoryToDelete(null);
  };

  useEffect(() => {
    if (isToastVisible) {
      const timer = setTimeout(() => {
        setIsToastVisible(false);
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isToastVisible]);

  return (
    <div className="container mx-auto p-6">
      <div className="border-b mb-4 pb-2">
        <h2 className="text-white text-sm bg-black inline-block p-2">
          ALL CATEGORIES
        </h2>
      </div>

        <div className="mt-8 border w-full">
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Category Name</TableHead>
                <TableHead className="w-[200px]">Posts Count</TableHead>
                <TableHead className="w-[180px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.length && categories.length > 0 ? (
                categories.map((category) => (
                  <TableRow key={category._id} className="border-b-2">
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.posts.length}</TableCell> 
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/dashboard/EditCategory/${category._id}`}>
                          <Button variant="outline" className="w-24">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          className="w-24"
                          onClick={() => openModal(category._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No categories found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Delete Confirmation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-lg font-semibold mb-4">
                Are you sure you want to delete this category?
              </h2>
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={deleteCategory}>
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        <ToastViewport />
        {isToastVisible && (
          <Toast className="text-green-500 bottom-96" onOpenChange={setIsToastVisible}>
            <ToastTitle>Success</ToastTitle>
            <ToastDescription>{toastMessage}</ToastDescription>
            <ToastClose />
          </Toast>
        )}
      </div>
    // </ToastProvider>
  );
};

export default AllCategories;
