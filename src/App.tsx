import { useState, useEffect } from "react";
import Window from "./components/Window";
import Modal from "./components/Modal";
import axios from "axios";
import DeleteModal from "./components/DeleteModal";
import Sidebar from "./components/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { setCredentials, clearAuth } from "./features/auth/authSlice";
import { fetchProducts, deleteProduct, fetchTutorial, type Item } from "./features/products/productSlice";
import type { AppDispatch } from "./app/store";
import WifiProvisionerModal from "./components/WifiProvision";
import { addName } from "./features/products/productSlice";
import PlaqueModal from "./components/PlaqueModel";
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | undefined>();
  const [editIndex, setEditIndex] = useState<number>();
  const [selectedItem, setSelectedItem] = useState<Item>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const auth = useSelector((state: any) => state.auth.token)
  const [isOpen, setIsOpen] = useState(false);
  const [openPlaque, setOpenPlaque] = useState(false)
  const [businessName, setBusinessName] = useState('')

  useEffect(() => {
    const name = async () => {
      console.log(auth)
      const response = await axios.get(`${apiUrl}/get_name`, { headers: { Authorization: `Bearer ${auth}` } })
      console.log(response.data.message)
      if (response.data.message.length < 1) {
        setOpenPlaque(true)
      }
    }
    name()
  }, [auth])

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
        console.log('test')
        dispatch(fetchTutorial())
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
    console.log(item)
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
    await axios.post(`${apiUrl}/delete_data`, selectedItem, { headers: { "Authorization": `Bearer ${auth}` } });
  };

  const handleSaveName = async (businessName: string) => {
    try {
      await axios.post(`${apiUrl}/add_business_name`,
        { name: businessName },
        { headers: { Authorization: `Bearer ${auth}` } }
      );
      dispatch(addName(businessName));
      setOpenPlaque(false)
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen w-full bg-[#b8f2f1] relative overflow-hidden" style={{ backgroundImage: "linear-gradient(90deg, rgba(184, 154, 122, 0) 0%, rgba(184, 154, 122, 0) 100%), linear-gradient(134.583deg, rgba(214, 242, 244, 0) 48.915%, rgb(167, 216, 255) 93.019%), linear-gradient(137.884deg, rgba(222, 242, 243, 1) 0%, rgb(214, 242, 244) 50.018%)" }}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main
        className={`w-full min-h-screen flex flex-col items-center justify-center p-6 md:p-8 relative md:ml-16`}
      >
        <Window handleEdit={handleEdit} setSelectedItem={setSelectedItem} openModal={() => setIsModalOpen(true)} openWiFi={() => setIsOpen(true)} />

        <div className="flex flex-col items-center justify-center">
          {isOpen && (
            <WifiProvisionerModal closeModal={() => setIsOpen(false)} />
          )}
          {isModalOpen && (
            <Modal
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
          {openPlaque && (
            <PlaqueModal isOpen={openPlaque} handleSaveName={handleSaveName} businessName={businessName} setBusinessName={setBusinessName} />
          )}
        </div>
      </main>
    </div>
  );
}
