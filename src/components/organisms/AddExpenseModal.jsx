import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import financialService from "@/services/api/financialService";
import fieldService from "@/services/api/fieldService";
import cropService from "@/services/api/cropService";

const AddExpenseModal = ({ isOpen, onClose, onSuccess }) => {
const [formData, setFormData] = useState({
    fieldId: "",
    cropId: "",
    category: "",
    description: "",
    amount: "0.00",
    quantity: "0",
    unit: "",
    pricePerUnit: "0.00",
    date: new Date().toISOString().split('T')[0],
    supplier: "",
    notes: ""
  });
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      const [fieldsData, cropsData] = await Promise.all([
        fieldService.getAll(),
        cropService.getAll()
      ]);
      setFields(fieldsData);
      setCrops(cropsData);
    } catch (error) {
      toast.error("Failed to load data for expense form");
    } finally {
      setInitialLoading(false);
    }
  };

const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Consolidate all state updates into a single operation
    setFormData(prev => {
      const updatedData = {
        ...prev,
        [name]: value
      };
      
      // Auto-calculate amount if quantity and price per unit are provided
if (name === "quantity" || name === "pricePerUnit") {
        const quantity = name === "quantity" ? parseFloat(value || "0") || 0 : parseFloat(prev.quantity || "0") || 0;
        const pricePerUnit = name === "pricePerUnit" ? parseFloat(value || "0") || 0 : parseFloat(prev.pricePerUnit || "0") || 0;
        
        if (quantity > 0 && pricePerUnit > 0) {
          updatedData.amount = (quantity * pricePerUnit).toFixed(2);
        } else if (quantity === 0 || pricePerUnit === 0) {
          updatedData.amount = "0.00";
        }
      }
      
      return updatedData;
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fieldId) {
      newErrors.fieldId = "Field is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await financialService.createExpense(formData);
      handleClose();
      onSuccess();
    } catch (error) {
      toast.error("Failed to add expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
setFormData({
      fieldId: "",
      cropId: "",
      category: "",
      description: "",
      amount: "0.00",
      quantity: "0",
      unit: "",
      pricePerUnit: "0.00",
      date: new Date().toISOString().split('T')[0],
      supplier: "",
      notes: ""
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const fieldOptions = fields.map(field => ({
    value: field.Id.toString(),
    label: field.name
  }));

  const cropOptions = [
    { value: "", label: "Select crop (optional)" },
    ...crops.map(crop => ({
      value: crop.Id.toString(),
      label: crop.name
    }))
  ];

  const categoryOptions = financialService.getExpenseCategories().map(category => ({
    value: category,
    label: category
  }));

  const unitOptions = financialService.getUnits();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Expense</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <ApperIcon name="X" size={24} />
          </button>
        </div>

        {initialLoading ? (
          <div className="p-6">
            <Loading />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Field *"
                error={errors.fieldId}
              >
                <select
                  name="fieldId"
                  value={formData.fieldId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select field</option>
                  {fieldOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Crop"
                error={errors.cropId}
              >
                <select
                  name="cropId"
                  value={formData.cropId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {cropOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Category *"
                error={errors.category}
              >
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Date *"
                error={errors.date}
              >
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </FormField>

              <FormField
                label="Description *"
                error={errors.description}
                className="md:col-span-2"
              >
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter expense description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </FormField>

              <FormField
                label="Quantity"
                error={errors.quantity}
              >
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="0"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </FormField>

              <FormField
                label="Unit"
                error={errors.unit}
              >
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select unit</option>
                  {unitOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Price per Unit"
                error={errors.pricePerUnit}
              >
                <input
                  type="number"
                  name="pricePerUnit"
                  value={formData.pricePerUnit}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </FormField>

              <FormField
label="Total Amount *"
                error={errors.amount}
              >
<input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </FormField>

              <FormField
                label="Supplier"
                error={errors.supplier}
                className="md:col-span-2"
              >
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  placeholder="Enter supplier name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </FormField>

              <FormField
                label="Notes"
                error={errors.notes}
                className="md:col-span-2"
              >
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes (optional)"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </FormField>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <ApperIcon name="Loader2" size={16} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Plus" size={16} />
                    Add Expense
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddExpenseModal;