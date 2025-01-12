import React, { useState, useEffect } from "react";
import { FiHome, FiShoppingCart, FiBox, FiTrash2, FiEdit2, FiPlus, FiCheck, FiSun, FiMoon, FiMail, FiLock, FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { MdOutlineNotifications } from "react-icons/md";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useAuth } from "./contexts/AuthContext";
import { db } from "./firebase";  
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { 
  getTasks, 
  saveTasks, 
  fetchUserData,
  initializeUserDocument,
  getCategories,
  saveCategories,
  getShopItems,
  saveShopItems,
  initializeShopItems,
  getStorageItems,
  saveStorageItems
} from './utils/database';

const AuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignIn) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.email, formData.password, formData.name);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-xl">
        <div className="text-center mb-8">
          <img
            src="https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?auto=format&fit=crop&w=100&h=100&q=80"
            alt="Habits Balancer Logo"
            className="mx-auto w-16 h-16 rounded-full mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800">Habits Balancer</h1>
          <p className="text-gray-600">Balance your habits, earn your rewards</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isSignIn && (
            <div>
              <label className="block text-gray-700 mb-2">Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Please wait...' : (isSignIn ? "Sign In" : "Sign Up")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignIn(!isSignIn);
              setError("");
            }}
            className="text-pink-500 hover:text-pink-600"
          >
            {isSignIn ? "Need an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileSettings = ({ onClose }) => {
  const { currentUser, updateUserEmail, updateUserPassword, updateUserProfile, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || "",
    email: currentUser?.email || "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (formData.password) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        await updateUserPassword(formData.password);
      }

      const promises = [];
      if (formData.email !== currentUser.email) {
        promises.push(updateUserEmail(formData.email));
      }
      if (formData.name !== currentUser.displayName) {
        promises.push(updateUserProfile(formData.name));
      }

      await Promise.all(promises);
      setSuccess("Profile updated successfully!");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">New Password (leave blank to keep current)</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                placeholder="Enter new password"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Confirm New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-pink-500"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>

        <button
          onClick={handleLogout}
          className="w-full mt-4 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
        >
          <FiLogOut />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const { currentUser, loading } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  
  if (loading) return <div>Loading...</div>;

  return currentUser ? (
    <>
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-full bg-white shadow-lg hover:bg-gray-100"
        >
          <FiSettings className="text-gray-700" />
        </button>
      </div>
      {showSettings && <ProfileSettings onClose={() => setShowSettings(false)} />}
      <TaskManager />
    </>
  ) : (
    <AuthPage />
  );
};

const DragHandle = () => (
  <div className="flex flex-col items-center justify-center w-6 h-8 cursor-grab active:cursor-grabbing">
    <div className="grid grid-cols-2 gap-1">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-gray-400 opacity-50"
        />
      ))}
    </div>
  </div>
);

const TaskManager = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [categories, setCategories] = useState([
    { id: "general", name: "General" },
    { id: "work", name: "Work" },
    { id: "personal", name: "Personal" }
  ]);
  
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [shopItems, setShopItems] = useState([
    { id: 1, name: "1 Hour YouTube", price: 100, description: "1 hour of YouTube time" },
    { id: 2, name: "2 Hour Movie", price: 200, description: "2 hours of movie time" }
  ]);

  const [storageItems, setStorageItems] = useState([]);
  const [totalPoints, setTotalPoints] = useState(500);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [notification, setNotification] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const [newTask, setNewTask] = useState({
    name: "",
    points: 0,
    category: "general",
    useType: "Unlimited",
    frequency: null,
    completed: false
  });

  const [newItem, setNewItem] = useState({
    name: "",
    price: 0
  });

  const [editingShopItem, setEditingShopItem] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleAddCategory = async () => {
    if (!currentUser || !newCategory.trim()) {
      setNotification("Category name cannot be empty");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    const normalizedNewCategory = newCategory.trim().toLowerCase();
    const isDuplicateCategory = categories.some(
      category => category.name.toLowerCase() === normalizedNewCategory
    );

    if (isDuplicateCategory) {
      setNotification("A category with this name already exists");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    const newCategoryObj = {
      id: normalizedNewCategory.replace(/\s+/g, '-'),
      name: newCategory.trim()
    };

    const updatedCategories = [...categories, newCategoryObj];

    try {
      // Update local state
      setCategories(updatedCategories);
      
      // Save to Firestore
      await saveCategories(currentUser.uid, updatedCategories);
      
      // Clear input
      setNewCategory('');
      setNotification("Category added successfully!");
    } catch (error) {
      console.error("Error adding category:", error);
      setNotification("Failed to add category");
    }
    setTimeout(() => setNotification(""), 3000);
  };

  const handleAddTask = async () => {
    if (!currentUser) return;

    // Validate task name and points
    if (!newTask.name || newTask.points <= 0) {
      setNotification("Please enter a valid task name and points");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    const normalizedTaskName = newTask.name.trim().toLowerCase();
    const isDuplicateTask = tasks.some(
      task => task.name.toLowerCase() === normalizedTaskName
    );

    if (isDuplicateTask) {
      setNotification("A task with this name already exists");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    const taskToAdd = {
      id: Date.now(), // Unique identifier
      name: newTask.name,
      points: newTask.points,
      category: newTask.category || 'general',
      useType: newTask.useType || 'Unlimited',
      frequency: newTask.frequency,
      completed: false,
      createdAt: new Date().toISOString()
    };

    try {
      // Create a new array of tasks with the new task
      const updatedTasks = [...tasks, taskToAdd];

      // Save tasks to Firestore
      await saveTasks(currentUser.uid, updatedTasks);

      // Update local state
      setTasks(updatedTasks);

      // Reset input fields
      setNewTask({
        name: "",
        points: 0,
        category: "",
        useType: "Unlimited",
        frequency: null,
        completed: false
      });

      setShowAddTask(false);

      // Show success notification
      setNotification("Task added successfully!");
      setTimeout(() => setNotification(""), 3000);
    } catch (error) {
      console.error("Error adding task:", error);
      setNotification("Failed to add task");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  const updatePointsInFirestore = async (newPoints) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { 
        points: newPoints 
      });
    } catch (error) {
      console.error("Error updating points:", error);
      setNotification("Failed to update points");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  const handleCompleteTask = async (taskId) => {
    if (!currentUser) {
      setNotification("You must be logged in to complete tasks");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    try {
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      setTasks(updatedTasks);

      const task = tasks.find(t => t.id === taskId);
      let newTotalPoints = totalPoints;
      if (!task.completed) {
        newTotalPoints += task.points;
        setTotalPoints(newTotalPoints);
        setNotification(`Earned ${task.points} points!`);
      }

      // Update Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { 
        tasks: updatedTasks,
        points: newTotalPoints
      });
    } catch (error) {
      console.error("Error completing task:", error);
      setNotification("Failed to complete task. Please try again.");
      await initializeTasksAndCategories(); // Reload original state
    }
    setTimeout(() => setNotification(""), 3000);
  };

  const handleBuyItem = async (itemId) => {
    const item = shopItems.find(i => i.id === itemId);
    
    if (!item) {
      setNotification("Item not found");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    if (totalPoints >= item.price) {
      const newTotalPoints = totalPoints - item.price;
      
      // Update local state
      setTotalPoints(newTotalPoints);
      
      // Add item to storage
      const uniqueStorageItem = {
        ...item,
        uniqueId: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        dateAcquired: new Date().toLocaleDateString(),
        inUse: false
      };
      const updatedStorageItems = [...storageItems, uniqueStorageItem];
      setStorageItems(updatedStorageItems);

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          points: newTotalPoints,
          storageItems: updatedStorageItems
        });

        setNotification(`Bought ${item.name} successfully!`);
        setTimeout(() => setNotification(""), 3000);
      } catch (error) {
        console.error("Error buying item:", error);
        setNotification("Failed to buy item");
        setTimeout(() => setNotification(""), 3000);
      }
    } else {
      setNotification("Not enough points");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  const handleSellItem = async (itemUniqueId) => {
    const item = storageItems.find(i => i.uniqueId === itemUniqueId);
    
    if (!item) {
      setNotification("Item not found in storage");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    const sellPrice = Math.floor(item.price * 0.5); // 50% of original price
    const newTotalPoints = totalPoints + sellPrice;
    
    // Remove only the specific item from storage
    const updatedStorageItems = storageItems.filter(i => i.uniqueId !== itemUniqueId);
    
    try {
      // Update local state
      setStorageItems(updatedStorageItems);
      setTotalPoints(newTotalPoints);

      // Update Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        points: newTotalPoints,
        storageItems: updatedStorageItems
      });

      setNotification(`Sold ${item.name} for ${sellPrice} points`);
      setTimeout(() => setNotification(""), 3000);
    } catch (error) {
      console.error("Error selling item:", error);
      setNotification("Failed to sell item");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination || !currentUser) return;

    try {
      const taskId = parseInt(result.draggableId);
      const newCategory = result.destination.droppableId;
      
      // Update local state first for immediate feedback
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, category: newCategory } : task
      );
      setTasks(updatedTasks);
      
      // Show feedback
      const categoryName = categories.find(cat => cat.id === newCategory)?.name;
      setNotification(`Task moved to ${categoryName}`);

      // Update Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { tasks: updatedTasks });
    } catch (error) {
      console.error("Error updating task category:", error);
      setNotification("Failed to move task. Please try again.");
      // Revert to original state
      await initializeTasksAndCategories();
    }
    setTimeout(() => setNotification(""), 3000);
  };

  const handleAddShopItem = async () => {
    if (!currentUser || !newItem.name || newItem.price <= 0) {
      setNotification("Please enter a valid item name and price");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    // Check for duplicate shop item names (case-insensitive)
    const normalizedItemName = newItem.name.trim().toLowerCase();
    const isDuplicateItem = shopItems.some(
      item => item.name.toLowerCase() === normalizedItemName
    );

    if (isDuplicateItem) {
      setNotification("A shop item with this name already exists");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    const shopItemToAdd = {
      id: Date.now(), // Unique identifier
      name: newItem.name.trim(),
      price: newItem.price,
      description: newItem.description || '',
      category: newItem.category || 'general'
    };

    try {
      // Create a new array of shop items with the new item
      const updatedShopItems = [...shopItems, shopItemToAdd];

      // Save shop items to Firestore
      await saveShopItems(currentUser.uid, updatedShopItems);

      // Update local state
      setShopItems(updatedShopItems);

      // Reset input fields
      setNewItem({
        name: "",
        price: 0,
        description: "",
        category: "general"
      });

      setShowAddItem(false);

      // Show success notification
      setNotification("Shop item added successfully!");
      setTimeout(() => setNotification(""), 3000);
    } catch (error) {
      console.error("Error adding shop item:", error);
      setNotification("Failed to add shop item");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  const handleDeleteShopItem = async (itemId) => {
    if (!currentUser) {
      setNotification("You must be logged in to delete shop items");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    try {
      // Update local state first
      const updatedShopItems = shopItems.filter(item => item.id !== itemId);
      setShopItems(updatedShopItems);

      // Update Firestore
      await saveShopItems(currentUser.uid, updatedShopItems);

      setNotification("Shop item deleted successfully!");
    } catch (error) {
      console.error("Error deleting shop item:", error);
      setNotification("Failed to delete shop item");
      
      // Reload original state
      const fetchedShopItems = await getShopItems(currentUser.uid);
      setShopItems(fetchedShopItems);
    }
    setTimeout(() => setNotification(""), 3000);
  };

  const handleUseItem = (itemUniqueId) => {
    const targetItem = storageItems.find(i => i.uniqueId === itemUniqueId);
    if (!targetItem) return;

    if (targetItem.inUse) {
      // If it's in use, remove just this specific item
      setStorageItems(prev => prev.filter(item => item.uniqueId !== itemUniqueId));
      setNotification(`Removed ${targetItem.name} from storage`);
    } else {
      // If it's not in use, set just this specific item to in use
      setStorageItems(prev => 
        prev.map(item => 
          item.uniqueId === itemUniqueId ? { ...item, inUse: true } : item
        )
      );
      setNotification(`Started using ${targetItem.name}`);
    }
    setTimeout(() => setNotification(""), 3000);
  };

  const handleUpdateShopItem = async (e) => {
    e.preventDefault();
    if (!editingShopItem || !currentUser) {
      setNotification("You must be logged in to update items");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    try {
      // Update local state first
      const updatedShopItems = shopItems.map(item => 
        item.id === editingShopItem.id ? editingShopItem : item
      );
      setShopItems(updatedShopItems);
      setNotification("Item updated successfully!");

      // Then update Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        shopItems: updatedShopItems
      });

      setEditingShopItem(null);
    } catch (error) {
      console.error("Error updating shop item:", error);
      setNotification("Failed to update item. Please try again.");
      // Revert the local state change if Firestore update fails
      await initializeShopItems(); // Reload the original state from Firestore
    }
    setTimeout(() => setNotification(""), 3000);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!currentUser || !editingTask) {
      console.error('No user or no task to update');
      return;
    }

    try {
      // Validate task
      if (!editingTask.name || editingTask.points < 0) {
        setNotification('Please enter a valid task name and points');
        return;
      }

      // Update tasks in local state
      const updatedTasks = tasks.map(task => 
        task.id === editingTask.id ? editingTask : task
      );

      // Save to Firestore
      await saveTasks(currentUser.uid, updatedTasks);

      // Update local state
      setTasks(updatedTasks);

      // Close edit form
      setEditingTask(null);

      // Show success notification
      setNotification('Task updated successfully!');
      setTimeout(() => setNotification(''), 3000);
    } catch (error) {
      console.error('Error updating task:', error);
      setNotification('Failed to update task');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleEditTaskClick = (task) => {
    console.log('Before setting editingTask', editingTask);
    console.log('Task being set', task);
    
    // Create a completely new object with all properties
    const newEditingTask = {
      ...task,
      id: task.id,  // Explicitly set ID
      name: task.name,
      points: task.points,
      category: task.category,
      useType: task.useType || 'Limited',
      frequency: task.frequency,
      completed: task.completed
    };
    
    setEditingTask(newEditingTask);
    console.log('After setting editingTask', newEditingTask);
  };

  // Initialize shop items in Firestore
  const initializeShopItems = async () => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Initialize user document if it doesn't exist
        await setDoc(userRef, {
          shopItems: [
            { id: 1, name: "1 Hour YouTube", price: 100, description: "1 hour of YouTube time" },
            { id: 2, name: "2 Hour Movie", price: 200, description: "2 hours of movie time" }
          ]
        }, { merge: true });
      } else if (!userDoc.data().shopItems) {
        // If shopItems field doesn't exist, add it
        await updateDoc(userRef, {
          shopItems: [
            { id: 1, name: "1 Hour YouTube", price: 100, description: "1 hour of YouTube time" },
            { id: 2, name: "2 Hour Movie", price: 200, description: "2 hours of movie time" }
          ]
        });
      }
    } catch (error) {
      console.error("Error initializing shop items:", error);
    }
  };

  // Load shop items when component mounts or user changes
  useEffect(() => {
    initializeShopItems();
  }, [currentUser]);

  const handleDeleteTask = async (taskId) => {
    if (!currentUser) {
      setNotification("You must be logged in to delete tasks");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    try {
      // Update local state first
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      setNotification("Task deleted successfully!");

      // Update Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { tasks: updatedTasks });
    } catch (error) {
      console.error("Error deleting task:", error);
      setNotification("Failed to delete task. Please try again.");
      await initializeTasksAndCategories(); // Reload original state
    }
    setTimeout(() => setNotification(""), 3000);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!currentUser) {
      setNotification("You must be logged in to delete categories");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    // Check if category has tasks
    const tasksInCategory = tasks.filter(task => task.category === categoryId);
    if (tasksInCategory.length > 0) {
      setNotification("Cannot delete category with existing tasks");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    try {
      // Update local state first
      const updatedCategories = categories.filter(category => category.id !== categoryId);
      setCategories(updatedCategories);
      setNotification("Category deleted successfully!");

      // Update Firestore
      await saveCategories(currentUser.uid, updatedCategories);
    } catch (error) {
      console.error("Error deleting category:", error);
      setNotification("Failed to delete category. Please try again.");
      // Reload original state
      const fetchedCategories = await getCategories(currentUser.uid);
      setCategories(fetchedCategories);
    }
    setTimeout(() => setNotification(""), 3000);
  };

  // Initialize tasks and categories in Firestore
  const initializeTasksAndCategories = async () => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create user document with initial data
        const initialData = {
          categories: [
            { id: "general", name: "General" },
            { id: "work", name: "Work" },
            { id: "personal", name: "Personal" }
          ],
          tasks: [
            {
              id: 1,
              name: "Complete Project Documentation",
              points: 100,
              category: "work",
              useType: "Limited",
              frequency: "Daily",
              completed: false
            },
            {
              id: 2,
              name: "Exercise Routine",
              points: 50,
              category: "general",
              useType: "Unlimited",
              frequency: null,
              completed: false
            }
          ],
          createdAt: new Date().toISOString()
        };
        await setDoc(userRef, initialData);
        setCategories(initialData.categories);
        setTasks(initialData.tasks);
      } else {
        // Load existing data
        const userData = userDoc.data();
        if (userData.categories) setCategories(userData.categories);
        if (userData.tasks) setTasks(userData.tasks);
      }
    } catch (error) {
      console.error("Error initializing tasks and categories:", error);
      setNotification("Failed to load tasks and categories");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  // Load tasks and categories when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Fetch user data, initializing if not exists
        const userData = await fetchUserData(currentUser.uid);
        
        // Set tasks from fetched data
        setTasks(userData.tasks || []);
        
        // Set points from fetched data, default to 500 if not exists
        setTotalPoints(userData.points || 500);
        
        // Set categories from fetched data
        const fetchedCategories = await getCategories(currentUser.uid);
        setCategories(fetchedCategories);
        
        // Set shop items from fetched data
        const fetchedShopItems = await getShopItems(currentUser.uid);
        setShopItems(fetchedShopItems.length > 0 ? fetchedShopItems : await initializeShopItems(currentUser.uid));
        
        // Set storage items from fetched data
        const fetchedStorageItems = await getStorageItems(currentUser.uid);
        setStorageItems(fetchedStorageItems);
        
        // Additional user data can be set to state if needed
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        // Set default values if loading fails
        setTotalPoints(500);
        setCategories([
          { id: "general", name: "General" },
          { id: "work", name: "Work" },
          { id: "personal", name: "Personal" }
        ]);
        setShopItems([
          { 
            id: 1, 
            name: "1 Hour YouTube", 
            price: 100, 
            description: "1 hour of YouTube time",
            category: "entertainment"
          },
          { 
            id: 2, 
            name: "2 Hour Movie", 
            price: 200, 
            description: "2 hours of movie time",
            category: "entertainment"
          }
        ]);
        setStorageItems([]);
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [currentUser]);

  const handleSaveTasks = async (updatedTasks) => {
    if (!currentUser) return;

    try {
      // Save tasks to Firestore
      await saveTasks(currentUser.uid, updatedTasks);
      
      // Update local state
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  // State for animated buttons
  const [animatedButton, setAnimatedButton] = useState({
    task: false,
    category: false,
    shop: false,
    home: false,
    storage: false
  });

  // Function to handle button animation
  const handleButtonAnimation = (type, isActive) => {
    setAnimatedButton(prev => ({
      ...prev,
      [type]: isActive
    }));

    // Auto-reset after 2 seconds if activated
    if (isActive) {
      setTimeout(() => {
        setAnimatedButton(prev => ({
          ...prev,
          [type]: false
        }));
      }, 2000);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>Tasks</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setShowAddTask(true);
                    handleButtonAnimation('task', true);
                  }}
                  onMouseEnter={() => handleButtonAnimation('task', true)}
                  onMouseLeave={() => handleButtonAnimation('task', false)}
                  className={`
                    flex items-center justify-center 
                    ${animatedButton.task 
                      ? 'w-48 px-4 py-2 space-x-2' 
                      : 'w-10 p-2'
                    } 
                    rounded-lg 
                    ${isDarkMode ? "bg-pink-600" : "bg-pink-500"} 
                    text-white 
                    overflow-hidden 
                    transition-all 
                    duration-300 
                    ease-in-out
                    relative
                  `}
                >
                  <FiPlus className={`${animatedButton.task ? 'opacity-0 absolute' : 'opacity-100'} transition-opacity duration-300`} />
                  {animatedButton.task && (
                    <span className="animate-typing whitespace-nowrap">
                      Add Task
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowAddCategory(true);
                    handleButtonAnimation('category', true);
                  }}
                  onMouseEnter={() => handleButtonAnimation('category', true)}
                  onMouseLeave={() => handleButtonAnimation('category', false)}
                  className={`
                    flex items-center justify-center 
                    ${animatedButton.category 
                      ? 'w-48 px-4 py-2 space-x-2' 
                      : 'w-10 p-2'
                    } 
                    rounded-lg 
                    ${isDarkMode ? "bg-gray-600" : "bg-gray-200"} 
                    ${isDarkMode ? "text-white" : "text-gray-800"} 
                    overflow-hidden 
                    transition-all 
                    duration-300 
                    ease-in-out
                    relative
                  `}
                >
                  <FiPlus className={`${animatedButton.category ? 'opacity-0 absolute' : 'opacity-100'} transition-opacity duration-300`} />
                  {animatedButton.category && (
                    <span className="animate-typing whitespace-nowrap">
                      Add Category
                    </span>
                  )}
                </button>
              </div>
            </div>
            {showAddTask && (
              <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                <input
                  type="text"
                  placeholder="Task name"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  className="w-full p-2 mb-2 rounded border bg-white text-gray-800"
                />
                <input
                  type="number"
                  placeholder="Points"
                  value={newTask.points}
                  onChange={(e) => setNewTask({ ...newTask, points: parseInt(e.target.value) })}
                  className="w-full p-2 mb-2 rounded border bg-white text-gray-800"
                />
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  className="w-full p-2 mb-2 rounded border bg-white text-gray-800"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddTask(false)}
                    className="px-4 py-2 rounded bg-gray-500 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTask}
                    className="px-4 py-2 rounded bg-pink-500 text-white"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {showAddCategory && (
              <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2 mb-2 rounded border"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddCategory(false)}
                    className="px-4 py-2 rounded bg-gray-500 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCategory}
                    className={`px-4 py-2 rounded ${isDarkMode ? "bg-purple-600" : "bg-purple-500"} text-white`}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(category => (
                  <Droppable droppableId={category.id} key={category.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-md`}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                            {category.name}
                          </h3>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                            title="Delete Category"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                        <div
                          className={`space-y-2 min-h-[100px] p-2 rounded-lg transition-colors ${
                            snapshot.isDraggingOver 
                              ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-100') 
                              : 'bg-transparent'
                          }`}
                        >
                          {tasks
                            .filter(task => task.category === category.id)
                            .map((task, index) => (
                              <Draggable
                                key={task.id}
                                draggableId={String(task.id)}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div 
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`flex items-center justify-between p-4 rounded-lg mb-2 group ${
                                      isDarkMode 
                                        ? "bg-gray-700 hover:bg-gray-600" 
                                        : "bg-gray-100 hover:bg-gray-200"
                                    } transition-colors duration-200 relative`}
                                  >
                                    <div className="flex items-center space-x-4">
                                      <div 
                                        {...provided.dragHandleProps} 
                                        className="absolute left-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0"
                                      >
                                        <DragHandle />
                                      </div>
                                      <button
                                        onClick={() => handleCompleteTask(task.id)}
                                        className={`p-2 rounded-full ${task.completed ? "bg-green-500" : "bg-gray-300"}`}
                                      >
                                        <FiCheck className="text-white" />
                                      </button>
                                      <div>
                                        <h3 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-800"} ${task.completed ? "line-through" : ""}`}>
                                          {task.name}
                                        </h3>
                                        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                          {task.points} points | {task.useType}
                                          {task.frequency && ` | ${task.frequency}`}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex space-x-2 z-10">
                                      <button
                                        onClick={() => handleEditTaskClick(task)}
                                        className={`p-2 ${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-800"} transition-colors`}
                                      >
                                        <FiEdit2 />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                      >
                                        <FiTrash2 />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </DragDropContext>
          </div>
        );

      case "shop":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>Shop</h2>
              <button
                onClick={() => {
                  setShowAddItem(true);
                  handleButtonAnimation('shop', true);
                }}
                onMouseEnter={() => handleButtonAnimation('shop', true)}
                onMouseLeave={() => handleButtonAnimation('shop', false)}
                className={`
                  flex items-center justify-center 
                  ${animatedButton.shop 
                    ? 'w-48 px-4 py-2 space-x-2' 
                    : 'w-10 p-2'
                  } 
                  rounded-lg 
                  ${isDarkMode ? "bg-pink-600" : "bg-pink-500"} 
                  text-white 
                  overflow-hidden 
                  transition-all 
                  duration-300 
                  ease-in-out
                  relative
                `}
              >
                <FiPlus className={`${animatedButton.shop ? 'opacity-0 absolute' : 'opacity-100'} transition-opacity duration-300`} />
                {animatedButton.shop && (
                  <span className="animate-typing whitespace-nowrap">
                    Add Item
                  </span>
                )}
              </button>
            </div>
            {showAddItem && (
              <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                <input
                  type="text"
                  placeholder="Item name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full p-2 mb-2 rounded border bg-white text-gray-800"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) })}
                  className="w-full p-2 mb-2 rounded border bg-white text-gray-800"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddItem(false)}
                    className="px-4 py-2 rounded bg-gray-500 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddShopItem}
                    className="px-4 py-2 rounded bg-pink-500 text-white"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
            {editingShopItem && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className={`p-6 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} w-full max-w-md`}>
                  <h3 className="text-xl font-bold text-white mb-4">Edit Shop Item</h3>
                  <form onSubmit={handleUpdateShopItem} className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Name</label>
                      <input
                        type="text"
                        value={editingShopItem.name}
                        onChange={(e) => setEditingShopItem({
                          ...editingShopItem,
                          name: e.target.value
                        })}
                        className="w-full p-2 rounded border bg-white text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Price (points)</label>
                      <input
                        type="number"
                        value={editingShopItem.price}
                        onChange={(e) => setEditingShopItem({
                          ...editingShopItem,
                          price: parseInt(e.target.value)
                        })}
                        className="w-full p-2 rounded border bg-white text-gray-800"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditingShopItem(null)}
                        className={`flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600`}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shopItems.map(item => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>{item.name}</h3>
                      <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{item.price} points</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingShopItem(item)}
                        className={`p-2 ${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-800"} transition-colors`}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDeleteShopItem(item.id)}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuyItem(item.id)}
                    className="w-full px-4 py-2 mt-2 rounded bg-pink-500 text-white hover:bg-pink-600"
                  >
                    Buy
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case "storage":
        return (
          <div className="space-y-4">
            <h2 className={`text-xl font-semibold mb-6 ${isDarkMode ? "text-white" : "text-gray-800"}`}>Storage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {storageItems.map(item => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
                >
                  <h3 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>{item.name}</h3>
                  <p className={`${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Acquired: {item.dateAcquired}</p>
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => handleUseItem(item.uniqueId)}
                      className={`w-full px-4 py-2 rounded ${item.inUse ? "bg-green-500" : "bg-pink-500"} text-white hover:opacity-90`}
                    >
                      {item.inUse ? "Stop Using" : "Use"}
                    </button>
                    <button
                      onClick={() => handleSellItem(item.uniqueId)}
                      className={`w-full px-4 py-2 rounded ${isDarkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300"} ${isDarkMode ? "text-white" : "text-gray-800"}`}
                    >
                      Sell
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    console.log('Current editingTask state:', {
      editingTask: editingTask ? { ...editingTask } : null,
      editingTaskType: typeof editingTask,
      editingTaskKeys: editingTask ? Object.keys(editingTask) : 'No task'
    });
  }, [editingTask]);

  return (
    <div className={`min-h-screen bg-gradient-to-br transition-colors duration-300 ${isDarkMode ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 to-pink-50"}`}
      style={{
        backgroundImage: isDarkMode ? 
          "url(https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80)" :
          "url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80)",
        backgroundSize: "cover",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="fixed top-4 right-20 z-50">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-opacity-80 backdrop-blur-sm bg-white dark:bg-gray-800 shadow-lg"
        >
          {isDarkMode ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-gray-700" />}
        </button>
      </div>

      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"} backdrop-blur-sm bg-opacity-90`}>
          <MdOutlineNotifications className="text-xl" />
          <span>{notification}</span>
        </div>
      )}

      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Task</h2>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                console.log('Submitting edited task:', editingTask);
                handleUpdateTask(e);
              }} 
              className="space-y-4"
            >
              <div>
                <label className="block text-gray-700 mb-2">Task Name</label>
                <input
                  type="text"
                  value={editingTask.name}
                  onChange={(e) => {
                    console.log('Name changed:', e.target.value);
                    setEditingTask(prev => ({
                      ...prev,
                      name: e.target.value
                    }));
                  }}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Points</label>
                <input
                  type="number"
                  value={editingTask.points}
                  onChange={(e) => {
                    console.log('Points changed:', e.target.value);
                    setEditingTask(prev => ({
                      ...prev,
                      points: parseInt(e.target.value) || 0
                    }));
                  }}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Category</label>
                <select
                  value={editingTask.category}
                  onChange={(e) => {
                    console.log('Category changed:', e.target.value);
                    setEditingTask(prev => ({
                      ...prev,
                      category: e.target.value
                    }));
                  }}
                  className="w-full p-2 border rounded"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Use Type</label>
                <select
                  value={editingTask.useType}
                  onChange={(e) => {
                    console.log('Use Type changed:', e.target.value);
                    setEditingTask(prev => ({
                      ...prev,
                      useType: e.target.value,
                      frequency: e.target.value === 'Unlimited' ? null : prev.frequency
                    }));
                  }}
                  className="w-full p-2 border rounded"
                >
                  <option value="Limited">Limited</option>
                  <option value="Unlimited">Unlimited</option>
                </select>
              </div>
              {editingTask.useType === 'Limited' && (
                <div>
                  <label className="block text-gray-700 mb-2">Frequency</label>
                  <select
                    value={editingTask.frequency || ''}
                    onChange={(e) => {
                      console.log('Frequency changed:', e.target.value);
                      setEditingTask(prev => ({
                        ...prev,
                        frequency: e.target.value || null
                      }));
                    }}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">None</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              )}
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    console.log('Cancelling edit');
                    setEditingTask(null);
                  }}
                  className="flex-1 p-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 p-2 bg-blue-500 text-white rounded"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className={`rounded-lg shadow-xl p-6 mb-8 backdrop-blur-md ${isDarkMode ? "bg-gray-900 bg-opacity-80" : "bg-white bg-opacity-80"}`}>
          <div className="flex items-center justify-between mb-8">
            <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>Task Manager</h1>
            <div className={`font-bold ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}>
              Total Points: {totalPoints}
            </div>
          </div>

          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveTab("home")}
              className={`
                flex items-center justify-center 
                ${animatedButton.home 
                  ? 'w-48 px-4 py-2 space-x-2' 
                  : 'w-10 p-2'
                } 
                rounded-lg 
                ${activeTab === "home" 
                  ? "bg-pink-500 text-white" : 
                  (isDarkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700")} 
                overflow-hidden 
                transition-all 
                duration-300 
                ease-in-out
                relative
              `}
              onMouseEnter={() => handleButtonAnimation('home', true)}
              onMouseLeave={() => handleButtonAnimation('home', false)}
            >
              <FiHome className={`${animatedButton.home ? 'opacity-0 absolute' : 'opacity-100'} transition-opacity duration-300`} />
              {animatedButton.home && (
                <span className="animate-typing whitespace-nowrap">
                  Home
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("shop")}
              className={`
                flex items-center justify-center 
                ${animatedButton.shop 
                  ? 'w-48 px-4 py-2 space-x-2' 
                  : 'w-10 p-2'
                } 
                rounded-lg 
                ${activeTab === "shop" 
                  ? "bg-pink-500 text-white" : 
                  (isDarkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700")} 
                overflow-hidden 
                transition-all 
                duration-300 
                ease-in-out
                relative
              `}
              onMouseEnter={() => handleButtonAnimation('shop', true)}
              onMouseLeave={() => handleButtonAnimation('shop', false)}
            >
              <FiShoppingCart className={`${animatedButton.shop ? 'opacity-0 absolute' : 'opacity-100'} transition-opacity duration-300`} />
              {animatedButton.shop && (
                <span className="animate-typing whitespace-nowrap">
                  Shop
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("storage")}
              className={`
                flex items-center justify-center 
                ${animatedButton.storage 
                  ? 'w-48 px-4 py-2 space-x-2' 
                  : 'w-10 p-2'
                } 
                rounded-lg 
                ${activeTab === "storage" 
                  ? "bg-pink-500 text-white" : 
                  (isDarkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-700")} 
                overflow-hidden 
                transition-all 
                duration-300 
                ease-in-out
                relative
              `}
              onMouseEnter={() => handleButtonAnimation('storage', true)}
              onMouseLeave={() => handleButtonAnimation('storage', false)}
            >
              <FiBox className={`${animatedButton.storage ? 'opacity-0 absolute' : 'opacity-100'} transition-opacity duration-300`} />
              {animatedButton.storage && (
                <span className="animate-typing whitespace-nowrap">
                  Storage
                </span>
              )}
            </button>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default App;