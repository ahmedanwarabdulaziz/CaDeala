'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Bars3Icon,
  FolderIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

interface SortableSubcategoryItemProps {
  subcategory: DatabaseSubcategory;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

function SortableSubcategoryItem({
  subcategory,
  onEdit,
  onDelete,
  onToggleActive,
}: SortableSubcategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subcategory.id });

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
            {subcategory.rounded_image ? (
              <img
                src={subcategory.rounded_image}
                alt={subcategory.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <FolderIcon className="h-5 w-5 text-gray-400" />
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">{subcategory.name}</h3>
              <p className="text-sm text-gray-500">{subcategory.description}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  subcategory.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {subcategory.is_active ? 'Active' : 'Inactive'}
                </span>
                {subcategory.is_featured && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleActive(subcategory.id, !subcategory.is_active)}
            className={`p-2 rounded-md ${
              subcategory.is_active
                ? 'text-green-600 hover:text-green-800 hover:bg-green-50'
                : 'text-red-600 hover:text-red-800 hover:bg-red-50'
            }`}
            title={subcategory.is_active ? 'Deactivate' : 'Activate'}
          >
            {subcategory.is_active ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
          </button>
          
          <button
            onClick={() => onEdit(subcategory.id)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
            title="Edit"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onDelete(subcategory.id)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SubcategoriesPage() {
  const { user, isAdmin, loading } = useAdmin();
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<DatabaseCategory | null>(null);
  const [subcategories, setSubcategories] = useState<DatabaseSubcategory[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (categoryId && isAdmin) {
      loadData();
    }
  }, [categoryId, isAdmin]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      console.log('🔍 Loading data for categoryId:', categoryId);
      
      // Load category first
      console.log('📋 Loading category...');
      const categoryData = await PostgreSQLService.getCategory(categoryId);
      console.log('✅ Category loaded:', categoryData);
      setCategory(categoryData);
      
      // Load subcategories
      console.log('📋 Loading subcategories...');
      const subcategoriesData = await PostgreSQLService.getSubcategories(categoryId);
      console.log('✅ Subcategories loaded:', subcategoriesData);
      setSubcategories(subcategoriesData);
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      alert(`Error loading subcategories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = subcategories.findIndex(sub => sub.id === active.id);
      const newIndex = subcategories.findIndex(sub => sub.id === over?.id);

      const newSubcategories = arrayMove(subcategories, oldIndex, newIndex);
      setSubcategories(newSubcategories);

      // Update order in database
      try {
        setUpdatingOrder(true);
        await PostgreSQLService.reorderSubcategories(newSubcategories);
      } catch (error) {
        console.error('Error updating order:', error);
        alert('Error updating subcategory order');
        // Reload subcategories to reset order
        loadData();
      } finally {
        setUpdatingOrder(false);
      }
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/categories/${categoryId}/subcategories/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await PostgreSQLService.deleteSubcategory(id);
        setSubcategories(prev => prev.filter(sub => sub.id !== id));
      } catch (error) {
        console.error('Error deleting subcategory:', error);
        alert('Error deleting subcategory');
      }
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await PostgreSQLService.updateSubcategory(id, { is_active: isActive });
      setSubcategories(prev =>
        prev.map(sub =>
          sub.id === id ? { ...sub, is_active: isActive } : sub
        )
      );
    } catch (error) {
      console.error('Error updating subcategory:', error);
      alert('Error updating subcategory');
    }
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
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Subcategories
                {category && (
                  <span className="text-lg font-normal text-gray-500 ml-2">
                    - {category.name}
                  </span>
                )}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage subcategories for this category. Drag and drop to reorder.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/admin/categories/${categoryId}/subcategories/create`)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Subcategory
          </button>
        </div>

        {/* Subcategories List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {loadingData ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading subcategories...</p>
              </div>
            ) : subcategories.length === 0 ? (
              <div className="text-center py-8">
                <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No subcategories</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first subcategory.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => router.push(`/admin/categories/${categoryId}/subcategories/create`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Subcategory
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
                    items={subcategories.map(sub => sub.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {subcategories.map((subcategory) => (
                      <SortableSubcategoryItem
                        key={subcategory.id}
                        subcategory={subcategory}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleActive={handleToggleActive}
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