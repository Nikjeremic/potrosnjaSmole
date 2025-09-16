import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Material } from '../types';
import { materialsAPI, inventoryAPI } from '../services/api';

const Materials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    totalWeight: 0,
    unit: 'kg'
  });
  const [error, setError] = useState('');
  const toast = useRef<Toast>(null);

  const unitOptions = [
    { label: 'kg', value: 'kg' },
    { label: 'g', value: 'g' },
    { label: 't', value: 't' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const materialsData = await materialsAPI.getAll();
      setMaterials(materialsData);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingMaterial(null);
    setFormData({
      name: '',
      totalWeight: 0,
      unit: 'kg'
    });
    setError('');
    setModalVisible(true);
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      totalWeight: material.totalWeight,
      unit: material.unit
    });
    setError('');
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await materialsAPI.delete(id);
      toast.current?.show({
        severity: 'success',
        summary: 'Uspešno',
        detail: 'Materijal je uspešno obrisan',
        life: 3000
      });
      fetchData();
    } catch (error: any) {
      console.error("Error deleting material:", error);
      const errorMessage = error.response?.data?.message || "Greška pri brisanju materijala";
      toast.current?.show({
        severity: 'error',
        summary: 'Greška',
        detail: errorMessage,
        life: 5000
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      
      if (editingMaterial) {
        await materialsAPI.update(editingMaterial._id, formData);
      } else {
        // Create material first
        const newMaterial = await materialsAPI.create(formData);
        
        // Automatically create inventory for the new material
        try {
          await inventoryAPI.createForMaterial(newMaterial._id, formData.totalWeight);
        } catch (inventoryError: any) {
          console.warn('Failed to create inventory:', inventoryError.response?.data?.message);
          // Don't fail the whole operation if inventory creation fails
        }
      }

      setModalVisible(false);
      fetchData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Greška pri čuvanju materijala');
    }
  };

  const actionsBodyTemplate = (rowData: Material) => {
    return (
      <div className="flex gap-2">
        <Button 
          icon="pi pi-pencil" 
          className="p-button-text p-button-sm"
          onClick={() => handleEdit(rowData)}
        />
        <Button 
          icon="pi pi-trash" 
          className="p-button-text p-button-sm p-button-danger"
          onClick={() => {
            confirmDialog({
              message: 'Da li ste sigurni da želite da obrišete ovaj materijal?',
              header: 'Potvrda brisanja',
              icon: 'pi pi-exclamation-triangle',
              accept: () => handleDelete(rowData._id)
            });
          }}
        />
      </div>
    );
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <div className="flex justify-content-between align-items-center mb-4">
        <h2>Upravljanje materijalima</h2>
        <div className="flex gap-2">
          <Button 
            icon="pi pi-refresh" 
            onClick={fetchData} 
            className="p-button-outlined"
          />
          <Button 
            label="Dodaj materijal" 
            icon="pi pi-plus" 
            onClick={handleAdd}
            severity="info"
          />
        </div>
      </div>

      <Card title="Materijali">
        <DataTable
          value={materials}

          paginator
          rows={10}
          emptyMessage="Nema materijala"
          className="p-datatable-sm"
        >
          <Column field="name" header="Naziv" />
          <Column 
            field="totalWeight" 
            header="Ukupna težina" 
            body={(rowData: Material) => `${rowData.totalWeight} ${rowData.unit}`}
          />
          <Column 
            field="consumedWeight" 
            header="Potrošeno" 
            body={(rowData: Material) => `${rowData.consumedWeight} ${rowData.unit}`}
          />
          <Column 
            field="availableWeight" 
            header="Dostupno" 
            body={(rowData: Material) => `${rowData.availableWeight} ${rowData.unit}`}
          />
          <Column 
            field="createdBy" 
            header="Uneo" 
            body={(rowData: Material) => 
              rowData.createdBy ? `${rowData.createdBy.firstName} ${rowData.createdBy.lastName}` : 'N/A'
            }
          />
          <Column 
            field="updatedBy" 
            header="Ažurirao" 
            body={(rowData: Material) => 
              rowData.updatedBy ? `${rowData.updatedBy.firstName} ${rowData.updatedBy.lastName}` : 'N/A'
            }
          />
          <Column header="Akcije" body={actionsBodyTemplate} />
        </DataTable>
      </Card>

      <Dialog
        header={editingMaterial ? 'Izmeni materijal' : 'Dodaj novi materijal'}
        visible={modalVisible}
        onHide={() => setModalVisible(false)}
        style={{ width: '500px' }}
      >
        {error && (
          <Message severity="error" text={error} className="mb-3" />
        )}
        
        <div className="grid">
          <div className="col-12">
            <div className="field">
              <label htmlFor="name" className="block mb-2">Naziv materijala</label>
              <InputText
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full"
                placeholder="Unesite naziv materijala"
              />
            </div>
          </div>
          
          <div className="col-12">
            <div className="field">
              <label htmlFor="totalWeight" className="block mb-2">Ukupna težina</label>
              <InputNumber
                id="totalWeight"
                value={formData.totalWeight}
                onValueChange={(e) => setFormData({...formData, totalWeight: e.value || 0})}
                className="w-full"
                min={0}
                suffix={` ${formData.unit}`}
              />
            </div>
          </div>
          
          <div className="col-12">
            <div className="field">
              <label htmlFor="unit" className="block mb-2">Jedinica</label>
              <Dropdown
                id="unit"
                value={formData.unit}
                options={unitOptions}
                onChange={(e) => setFormData({...formData, unit: e.value})}
                className="w-full"
                appendTo="self"
              />
            </div>
          </div>
          
          <div className="col-12 flex justify-content-end gap-2">
            <Button 
              label={editingMaterial ? 'Ažuriraj' : 'Kreiraj'}
              onClick={handleSubmit}
              severity="info"
            />
            <Button 
              label="Otkaži"
              onClick={() => setModalVisible(false)}
              className="p-button-outlined"
            />
          </div>
        </div>
      </Dialog>

      <ConfirmDialog />
    </div>
  );
};

export default Materials;
