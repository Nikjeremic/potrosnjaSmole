import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Resin, Material } from '../types';
import { resinsAPI, materialsAPI } from '../services/api';

const Resins: React.FC = () => {
  const [resins, setResins] = useState<Resin[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingResin, setEditingResin] = useState<Resin | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    materialId: '',
    weight: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resinsData, materialsData] = await Promise.all([
        resinsAPI.getAll(),
        materialsAPI.getAll()
      ]);
      setResins(resinsData);
      setMaterials(materialsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingResin(null);
    setFormData({
      name: '',
      materialId: '',
      weight: 0
    });
    setError('');
    setModalVisible(true);
  };

  const handleEdit = (resin: Resin) => {
    setEditingResin(resin);
    setFormData({
      name: resin.name,
      materialId: resin.materialId,
      weight: resin.weight
    });
    setError('');
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await resinsAPI.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting resin:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      
      if (editingResin) {
        await resinsAPI.update(editingResin._id, formData);
      } else {
        await resinsAPI.create(formData);
      }

      setModalVisible(false);
      fetchData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Greška pri čuvanju sarze');
    }
  };

  const actionsBodyTemplate = (rowData: Resin) => {
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
              message: 'Da li ste sigurni da želite da obrišete ovu sarzu?',
              header: 'Potvrda brisanja',
              icon: 'pi pi-exclamation-triangle',
              accept: () => handleDelete(rowData._id)
            });
          }}
        />
      </div>
    );
  };

  const materialOptions = materials.map(material => ({
    label: `${material.name} (${material.availableWeight} ${material.unit} dostupno)`,
    value: material._id
  }));

  return (
    <div className="p-4">
      <div className="flex justify-content-between align-items-center mb-4">
        <h2>Upravljanje sarzama (receptima)</h2>
        <div className="flex gap-2">
          <Button 
            icon="pi pi-refresh" 
            onClick={fetchData} 

            className="p-button-outlined"
          />
          <Button 
            label="Dodaj sarzu" 
            icon="pi pi-plus" 
            onClick={handleAdd}
            severity="info"
          />
        </div>
      </div>

      <Card title="Sarze (recepti)">
        <DataTable
          value={resins}

          paginator
          rows={10}
          emptyMessage="Nema sarzi"
          className="p-datatable-sm"
        >
          <Column field="name" header="Naziv sarze" />
          <Column field="materialName" header="Materijal" />
          <Column 
            field="weight" 
            header="Težina po sarzi" 
            body={(rowData: Resin) => `${rowData.weight} kg`}
          />
          <Column header="Akcije" body={actionsBodyTemplate} />
        </DataTable>
      </Card>

      <Dialog
        header={editingResin ? 'Izmeni sarzu' : 'Dodaj novu sarzu'}
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
              <label htmlFor="name" className="block mb-2">Naziv sarze</label>
              <InputText
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full"
                placeholder="Unesite naziv sarze (npr. BMGR-1)"
              />
            </div>
          </div>
          
          <div className="col-12">
            <div className="field">
              <label htmlFor="materialId" className="block mb-2">Materijal</label>
              <Dropdown
                id="materialId"
                value={formData.materialId}
                options={materialOptions}
                onChange={(e) => setFormData({...formData, materialId: e.value})}
                className="w-full"
                placeholder="Odaberite materijal"
                appendTo="self"
              />
            </div>
          </div>
          
          <div className="col-12">
            <div className="field">
              <label htmlFor="weight" className="block mb-2">Težina po sarzi (kg)</label>
              <InputNumber
                id="weight"
                value={formData.weight}
                onValueChange={(e) => setFormData({...formData, weight: e.value || 0})}
                className="w-full"
                min={0}
                suffix=" kg"
              />
            </div>
          </div>
          
          <div className="col-12 flex justify-content-end gap-2">
            <Button 
              label={editingResin ? 'Ažuriraj' : 'Kreiraj'}
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

export default Resins;
