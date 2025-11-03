import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Package, Upload, X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
  parent_id: string | null;
  display_order: number;
  product_count?: number;
  parent_name?: string;
  subcategory_count?: number;
}

const AdminCategories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [majorCategories, setMajorCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    is_active: true,
    parent_id: null as string | null,
    display_order: 0
  });
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchCategories();
    } else {
      navigate('/');
    }
  }, [user, navigate]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order')
        .order('name');

      if (error) throw error;
      
      // Get major categories (for parent dropdown)
      const majors = (data || []).filter(cat => !cat.parent_id);
      setMajorCategories(majors);
      
      // Get product counts and subcategory counts for each category
      const categoriesWithCounts = await Promise.all(
        (data || []).map(async (category) => {
          const { count: productCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('is_active', true);
          
          const { count: subcategoryCount } = await supabase
            .from('categories')
            .select('*', { count: 'exact', head: true })
            .eq('parent_id', category.id)
            .eq('is_active', true);
          
          // Get parent name if this is a subcategory
          let parent_name = null;
          if (category.parent_id) {
            const parent = data.find(c => c.id === category.parent_id);
            parent_name = parent?.name;
          }
          
          return {
            ...category,
            product_count: productCount || 0,
            subcategory_count: subcategoryCount || 0,
            parent_name
          };
        })
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      // Categories fetch error handled by loading state
      toast({
        title: "Error",
        description: "Failed to load categories.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'name' && { slug: generateSlug(value) })
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      is_active: true,
      parent_id: null,
      display_order: 0
    });
    setEditingCategory(null);
    setUploadedFile(null);
    setImagePreview(null);
    setUploadMethod('url');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a JPEG, PNG, or WEBP image.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image under 5MB.",
        variant: "destructive"
      });
      return;
    }
    
    setUploadedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('category-images')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image to storage.",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Please enter a category name.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate image
    if (uploadMethod === 'upload' && !uploadedFile && !editingCategory?.image_url) {
      toast({
        title: "Validation Error",
        description: "Please select an image to upload.",
        variant: "destructive"
      });
      return;
    }
    
    if (uploadMethod === 'url' && !formData.image_url) {
      toast({
        title: "Validation Error",
        description: "Please enter an image URL.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      
      let imageUrl = formData.image_url;
      
      // Upload file if upload method is selected and file exists
      if (uploadMethod === 'upload' && uploadedFile) {
        const uploadedUrl = await uploadImageToStorage(uploadedFile);
        if (!uploadedUrl) {
          setUploading(false);
          return;
        }
        imageUrl = uploadedUrl;
      }
      
      const categoryData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        image_url: imageUrl,
        is_active: formData.is_active,
        parent_id: formData.parent_id,
        display_order: formData.display_order
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Category updated successfully."
        });
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([categoryData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Category created successfully."
        });
      }

      resetForm();
      setIsAddDialogOpen(false);
      fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save category.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      is_active: category.is_active,
      parent_id: category.parent_id,
      display_order: category.display_order
    });
    setImagePreview(category.image_url || null);
    setUploadMethod('url');
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also affect associated products.')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Category deleted successfully."
      });
      
      fetchCategories();
    } catch (error) {
      // Delete error handled by toast
      toast({
        title: "Error",
        description: "Failed to delete category.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Category Management - Admin Dashboard</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Category Management</h1>
              <p className="text-muted-foreground">Manage your store categories</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Category Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="parent">Parent Category</Label>
                      <select
                        id="parent"
                        value={formData.parent_id || ''}
                        onChange={(e) => handleInputChange('parent_id', e.target.value || null)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">None (Major Category)</option>
                        {majorCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">Leave empty for major category, select parent for subcategory</p>
                    </div>
                    <div>
                      <Label htmlFor="display_order">Display Order</Label>
                      <Input
                        id="display_order"
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => handleInputChange('display_order', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      placeholder="Describe this category..."
                    />
                  </div>
                  
                  <div>
                    <Label>Category Image</Label>
                    <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as 'url' | 'upload')} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="url">Image URL</TabsTrigger>
                        <TabsTrigger value="upload">Upload Image</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="url" className="space-y-2">
                        <Input
                          id="image_url"
                          value={formData.image_url}
                          onChange={(e) => {
                            handleInputChange('image_url', e.target.value);
                            setImagePreview(e.target.value);
                          }}
                          placeholder="https://example.com/category-image.jpg"
                        />
                        {imagePreview && uploadMethod === 'url' && (
                          <div className="relative w-full h-32 border rounded-lg overflow-hidden bg-muted">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                              onError={() => setImagePreview(null)}
                            />
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="upload" className="space-y-2">
                        <div className="flex flex-col gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadedFile ? 'Change Image' : 'Select Image'}
                          </Button>
                          
                          {uploadedFile && (
                            <div className="flex items-center gap-2 p-2 bg-muted rounded">
                              <ImageIcon className="h-4 w-4" />
                              <span className="text-sm flex-1 truncate">{uploadedFile.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setUploadedFile(null);
                                  setImagePreview(null);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                  }
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          
                          {imagePreview && uploadMethod === 'upload' && (
                            <div className="relative w-full h-32 border rounded-lg overflow-hidden bg-muted">
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <p className="text-xs text-muted-foreground">
                            Supported formats: JPEG, PNG, WEBP (Max 5MB)
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={uploading}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={uploading}>
                      {uploading ? 'Uploading...' : editingCategory ? 'Update Category' : 'Create Category'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading categories...</p>
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Subcategories</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <img 
                          src={category.image_url || '/placeholder.svg'} 
                          alt={category.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {category.parent_id && <span className="text-muted-foreground mr-2">└</span>}
                        {category.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.parent_id ? "outline" : "default"}>
                          {category.parent_id ? 'Subcategory' : 'Major'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {category.parent_name || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {category.subcategory_count || 0}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <span>{category.product_count}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{category.display_order}</TableCell>
                      <TableCell>
                        <Badge variant={category.is_active ? "default" : "secondary"}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive"
                            onClick={() => handleDelete(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {categories.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No categories found</p>
                </div>
              )}
            </Card>
          )}
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default AdminCategories;