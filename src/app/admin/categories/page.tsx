'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import AdminLayout from '@/components/AdminLayout';
import { PostgreSQLService, DatabaseCategory, DatabaseSubcategory } from '@/lib/postgresql';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  StarIcon,
  Bars3Icon,
  FolderIcon,
} from '@heroicons/react/24/outline';

interface SortableCategoryItemProps {
  category: DatabaseCategory;
  subcategories: DatabaseSubcategory[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onToggleFeatured: (id: string, isFeatured: boolean) => void;
  onViewSubcategories: (id: string) => void;
}

function SortableCategoryItem({
  category,
  subcategories,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
  onViewSubcategories,
}: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-4 mb-3 ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            <Bars3Icon className="h-5 w-5" />
          </div>
          
          <div className="flex items-center space-x-3">
            {category.rounded_image ? (
              <img
                src={category.rounded_image}
                alt={category.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <FolderIcon className="h-5 w-5 text-gray-400" />
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
              <p className="text-sm text-gray-500">{category.description}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-400">Order: {category.order}</span>
                <span className="text-xs text-gray-400">Slug: {category.slug}</span>
                <span className="text-xs text-blue-600 font-medium">
                  {subcategories.length} subcategories
                </span>
              </div>
              {subcategories.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {subcategories.slice(0, 3).map((sub) => (
                      <span
                        key={sub.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                      >
                        {sub.name}
                      </span>
                    ))}
                    {subcategories.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                        +{subcategories.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewSubcategories(category.id)}
            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
            title="View Subcategories"
          >
            <FolderIcon className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onToggleActive(category.id, !category.is_active)}
            className={`p-2 rounded-md ${
              category.is_active
                ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
            title={category.is_active ? 'Deactivate' : 'Activate'}
          >
            {category.is_active ? (
              <EyeIcon className="h-4 w-4" />
            ) : (
              <EyeSlashIcon className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={() => onToggleFeatured(category.id, !category.is_featured)}
            className={`p-2 rounded-md ${
              category.is_featured
                ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
            title={category.is_featured ? 'Remove from Featured' : 'Add to Featured'}
          >
            <StarIcon className="h-4 w-4" />
          </button>

          <button
            onClick={() => onEdit(category.id)}
            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
            title="Edit"
          >
            <PencilIcon className="h-4 w-4" />
          </button>

          <button
            onClick={() => onDelete(category.id)}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const { user, isAdmin, loading } = useAdmin();
  const router = useRouter();
  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState<{ [categoryId: string]: DatabaseSubcategory[] }>({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (isAdmin) {
      loadCategories();
    }
  }, [isAdmin]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoriesData = await PostgreSQLService.getCategories();
      setCategories(categoriesData);
      
      // Load subcategories for each category
      const subcategoriesData: { [categoryId: string]: DatabaseSubcategory[] } = {};
      for (const category of categoriesData) {
        try {
          const subcategories = await PostgreSQLService.getSubcategories(category.id);
          subcategoriesData[category.id] = subcategories;
        } catch (error) {
          console.error(`Error loading subcategories for category ${category.id}:`, error);
          subcategoriesData[category.id] = [];
        }
      }
      setSubcategoriesMap(subcategoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      alert('Error loading categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = categories.findIndex(cat => cat.id === active.id);
      const newIndex = categories.findIndex(cat => cat.id === over?.id);

      const newCategories = arrayMove(categories, oldIndex, newIndex);
      setCategories(newCategories);

      // Update order in database
      try {
        setUpdatingOrder(true);
        // Note: PostgreSQL doesn't have a built-in reorder method, so we'll update each category individually
        for (let i = 0; i < newCategories.length; i++) {
          await PostgreSQLService.updateCategory(newCategories[i].id, { order: i + 1 });
        }
      } catch (error) {
        console.error('Error updating order:', error);
        alert('Error updating category order');
        // Reload categories to reset order
        loadCategories();
      } finally {
        setUpdatingOrder(false);
      }
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/categories/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await PostgreSQLService.deleteCategory(id);
        setCategories(prev => prev.filter(cat => cat.id !== id));
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category');
      }
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await PostgreSQLService.updateCategory(id, { is_active: isActive });
      setCategories(prev =>
        prev.map(cat =>
          cat.id === id ? { ...cat, is_active: isActive } : cat
        )
      );
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error updating category');
    }
  };

  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      await PostgreSQLService.updateCategory(id, { is_featured: isFeatured });
      setCategories(prev =>
        prev.map(cat =>
          cat.id === id ? { ...cat, is_featured: isFeatured } : cat
        )
      );
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error updating category');
    }
  };

  const handleViewSubcategories = (id: string) => {
    router.push(`/admin/categories/${id}/subcategories`);
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your gift card categories. Drag and drop to reorder.
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/categories/create')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Category
          </button>
        </div>

        {/* Categories List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {loadingCategories ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first category.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/admin/categories/create')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Category
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {updatingOrder && (
                  <div className="flex items-center justify-center py-2 bg-blue-50 rounded-md">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm text-blue-600">Updating order...</span>
                  </div>
                )}
                
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={categories.map(cat => cat.id)}
                    strategy={verticalListSortingStrategy}
                  >
                                         {categories.map((category) => (
                       <SortableCategoryItem
                         key={category.id}
                         category={category}
                         subcategories={subcategoriesMap[category.id] || []}
                         onEdit={handleEdit}
                         onDelete={handleDelete}
                         onToggleActive={handleToggleActive}
                         onToggleFeatured={handleToggleFeatured}
                         onViewSubcategories={handleViewSubcategories}
                       />
                     ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 