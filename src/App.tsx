import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import HangingSign from "./components/HangingSign";
import Window from "./components/Window";
import Modal from "./components/Modal";
import axios from "axios";
import DeleteModal from "./components/DeleteModal";
import Sidebar from "./components/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { setCredentials, clearAuth } from "./features/auth/authSlice";
import { fetchProducts, deleteProduct } from "./features/products/productSlice";
import type { AppDispatch } from "./app/store";

interface Item {
  fileUrl: string;
  item: string;
  price: number;
  id: string;
  quantity: string;
}

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [editItem, setEditItem] = useState<Item | undefined>();
  const [editIndex, setEditIndex] = useState<number>();
  const [selectedItem, setSelectedItem] = useState<Item>();
  const sidebarWidth = collapsed ? "ml-16" : "ml-48";
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const auth = useSelector((state: any) => state.auth.token)

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken(true);
        console.log(token)
        dispatch(
          setCredentials({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
            },
            token,
          })
        );
        dispatch(fetchProducts());
      } else {
        dispatch(clearAuth());
        navigate("/signin");
      }
    });

    return () => unsubscribe();
  }, [dispatch, navigate]);

  // ✅ Don’t render app until Firebase finished checking
  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#b8f2f1]">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  // ✅ If initialized and no user, redirect handled above
  if (!user) return null;

  const handleEdit = (item: Item, index: number) => {
    setEditItem(item);
    setEditIndex(index);
    setIsModalOpen(true);
  };

  const onClose = () => {
    setEditIndex(undefined);
    setEditItem(undefined);
    setIsModalOpen(false);
  };

  const closeDeleteModal = () => setSelectedItem(undefined);

  const deleteItem = async () => {
    dispatch(deleteProduct(selectedItem?.id as string));
    console.log(user)
    await axios.post("http://localhost:3001/delete_data", selectedItem, { headers: { "Authorization": `Bearer ${auth}` } });
  };

  return (
    <div className="h-screen w-full bg-[#b8f2f1] relative overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {!mobileOpen && (
        <div className="absolute top-4 left-4 md:hidden z-40">
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="p-2 rounded bg-white shadow-md"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      )}

      <main
        className={`w-full min-h-screen flex flex-col items-center justify-center p-6 md:p-8 relative md:${sidebarWidth}`}
      >
        <Window handleEdit={handleEdit} setSelectedItem={setSelectedItem} />

        <HangingSign onClick={() => setIsModalOpen(true)} />
        <div className="flex flex-col items-center justify-center">
          {isModalOpen && (
            <Modal
              setItems={setItems}
              onClose={onClose}
              isOpen={isModalOpen}
              itemToEdit={editItem}
              editIndex={editIndex}
            />
          )}
          {selectedItem && (
            <DeleteModal
              onClose={closeDeleteModal}
              onConfirm={deleteItem}
              item={selectedItem}
            />
          )}
        </div>
      </main>
    </div>
  );
}
