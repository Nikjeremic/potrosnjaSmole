import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Message } from 'primereact/message';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Consumption as ConsumptionType, Resin, Inventory } from '../types';
import { consumptionAPI, resinsAPI, inventoryAPI } from '../services/api';
import { formatDate, getTodayDateString, SHIFTS } from '../utils/shiftUtils';
import dayjs from 'dayjs';

const Consumption: React.FC = () => {
  const [consumptions, setConsumptions] = useState<ConsumptionType[]>([]);
  const [resins, setResins] = useState<Resin[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingConsumption, setEditingConsumption] = useState<ConsumptionType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    date: new Date(getTodayDateString()),
    shift: 'first' as 'first' | 'second' | 'third',
    employeeName: '',
    resinId: '',
    usageCount: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const dateString = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : undefined;
      const [consumptionData, resinsData, inventoryData] = await Promise.all([
        consumptionAPI.getAll(dateString),
        resinsAPI.getAll(),
        inventoryAPI.getAll()
      ]);
      
      setConsumptions(consumptionData);
      setResins(resinsData);
      setInventory(inventoryData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingConsumption(null);
    setFormData({
      date: selectedDate || new Date(getTodayDateString()),
      shift: 'first',
      employeeName: '',
      resinId: '',
      usageCount: 0
    });
    setError('');
    setModalVisible(true);
  };

  const handleEdit = (consumption: ConsumptionType) => {
    setEditingConsumption(consumption);
    setFormData({
      date: new Date(consumption.date),
      shift: consumption.shift,
      employeeName: consumption.employeeName,
      resinId: consumption.resinId,
      usageCount: consumption.usageCount
    });
    setError('');
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await consumptionAPI.delete(id);
      fetchData();
    } catch (error: any) {
      console.error("Error deleting consumption:", error);
      setError(error.response?.data?.message || "Greška pri brisanju zapisa potrošnje");
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      const consumptionData = {
        ...formData,
        date: dayjs(formData.date).format('YYYY-MM-DD')
      };

      if (editingConsumption) {
        await consumptionAPI.update(editingConsumption._id, consumptionData);
      } else {
        await consumptionAPI.create(consumptionData);
      }

      setModalVisible(false);
      fetchData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Greška pri čuvanju zapisa');
    }
  };

  const getTotalConsumption = () => {
    return consumptions.reduce((total, item) => total + item.totalConsumption, 0);
  };

  const getTotalAvailableWeight = () => {
    return inventory.reduce((total, item) => total + item.availableWeight, 0);
  };

  const shiftBodyTemplate = (rowData: ConsumptionType) => {
    const shiftInfo = SHIFTS.find(s => s.shift === rowData.shift);
    return shiftInfo?.label || rowData.shift;
  };

  const actionsBodyTemplate = (rowData: ConsumptionType) => {
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
              message: 'Da li ste sigurni da želite da obrišete ovaj zapis?',
              header: 'Potvrda brisanja',
              icon: 'pi pi-exclamation-triangle',
              accept: () => handleDelete(rowData._id)
            });
          }}
        />
      </div>
    );
  };

  const shiftOptions = SHIFTS.map(shift => ({
    label: shift.label,
    value: shift.shift
  }));

  const resinOptions = resins.map(resin => ({
    label: `${resin.name} (${resin.weight}kg)`,
    value: resin._id
  }));

  const clearFilter = () => {
    setSelectedDate(null);
  };

  const getTitle = () => {
    if (selectedDate) {
      return `Potrošnja za ${formatDate(dayjs(selectedDate).format('YYYY-MM-DD'))}`;
    }
    return 'Sva potrošnja';
  };

  return (
    <div className="p-4">
      <div className="flex justify-content-between align-items-center mb-4">
        <h2>Praćenje potrošnje</h2>
        <div className="flex gap-2">
          <Calendar
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.value as Date)}
            dateFormat="dd.mm.yy"
            showIcon
            placeholder="Filtriraj po datumu"
          />
          <Button 
            icon="pi pi-refresh" 
            onClick={fetchData} 

            className="p-button-outlined"
          />
          {selectedDate && (
            <Button 
              label="Prikaži sve" 
              icon="pi pi-times" 
              onClick={clearFilter}
              className="p-button-outlined"
            />
          )}
          <Button 
            label="Dodaj zapis" 
            icon="pi pi-plus" 
            onClick={handleAdd}
            severity="info"
          />
        </div>
      </div>

      <div className="grid mb-4">
        <div className="col-12 md:col-3">
          <Card className="custom-statistic-card">
            <div className="custom-statistic-value text-green-500">
              {getTotalAvailableWeight().toFixed(2)}
            </div>
            <div className="custom-statistic-label">Ukupno dostupno (kg)</div>
          </Card>
        </div>
        <div className="col-12 md:col-3">
          <Card className="custom-statistic-card">
            <div className="custom-statistic-value text-blue-500">
              {getTotalConsumption().toFixed(2)}
            </div>
            <div className="custom-statistic-label">
              {selectedDate ? `Potrošeno ${formatDate(dayjs(selectedDate).format('YYYY-MM-DD'))}` : 'Ukupna potrošnja'}
            </div>
          </Card>
        </div>
        <div className="col-12 md:col-3">
          <Card className="custom-statistic-card">
            <div className="custom-statistic-value text-purple-500">
              {consumptions.length}
            </div>
            <div className="custom-statistic-label">Broj zapisa</div>
          </Card>
        </div>
        <div className="col-12 md:col-3">
          <Card className="custom-statistic-card">
            <div className="custom-statistic-value text-orange-500">
              {resins.length}
            </div>
            <div className="custom-statistic-label">Broj sarzi</div>
          </Card>
        </div>
      </div>

      <Card title={getTitle()}>
        <DataTable
          value={consumptions}

          paginator
          rows={10}
          emptyMessage={selectedDate ? "Nema podataka za odabrani datum" : "Nema podataka"}
          className="p-datatable-sm"
        >
          <Column field="date" header="Datum" body={(rowData: ConsumptionType) => formatDate(rowData.date)} />
          <Column field="shift" header="Smena" body={shiftBodyTemplate} />
          <Column field="employeeName" header="Zaposleni" />
          <Column field="resinName" header="Sarza" />
          <Column field="materialName" header="Materijal" />
          <Column field="usageCount" header="Vezivo" />
          <Column 
            field="totalConsumption" 
            header="Potrošnja (kg)" 
            body={(rowData: ConsumptionType) => `${rowData.totalConsumption.toFixed(2)} kg`}
          />
          <Column header="Akcije" body={actionsBodyTemplate} />
        </DataTable>
      </Card>

      <Dialog
        header={editingConsumption ? 'Izmeni zapis' : 'Dodaj novi zapis'}
        visible={modalVisible}
        onHide={() => setModalVisible(false)}
        style={{ width: '600px' }}
      >
        {error && (
          <Message severity="error" text={error} className="mb-3" />
        )}
        
        <div className="grid">
          <div className="col-12">
            <div className="field">
              <label htmlFor="date" className="block mb-2">Datum</label>
              <Calendar
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.value as Date})}
                dateFormat="dd.mm.yy"
                showIcon
                className="w-full"
                appendTo="self"
              />
            </div>
          </div>
          
          <div className="col-12">
            <div className="field">
              <label htmlFor="shift" className="block mb-2">Smena</label>
              <Dropdown
                id="shift"
                value={formData.shift}
                options={shiftOptions}
                onChange={(e) => setFormData({...formData, shift: e.value})}
                className="w-full"
                appendTo="self"
              />
            </div>
          </div>
          
          <div className="col-12">
            <div className="field">
              <label htmlFor="employeeName" className="block mb-2">Ime i prezime zaposlenog</label>
              <InputText
                id="employeeName"
                value={formData.employeeName}
                onChange={(e) => setFormData({...formData, employeeName: e.target.value})}
                className="w-full"
                placeholder="Unesite ime i prezime zaposlenog"
              />
            </div>
          </div>
          
          <div className="col-12">
            <div className="field">
              <label htmlFor="resinId" className="block mb-2">Sarza</label>
              <Dropdown
                id="resinId"
                value={formData.resinId}
                options={resinOptions}
                onChange={(e) => setFormData({...formData, resinId: e.value})}
                className="w-full"
                placeholder="Odaberite sarzu"
                appendTo="self"
              />
            </div>
          </div>
          
          <div className="col-12">
            <div className="field">
              <label htmlFor="usageCount" className="block mb-2">Vezivo</label>
              <InputText
                id="usageCount"
                type="number"
                min={0}
                value={formData.usageCount.toString()}
                onChange={(e) => setFormData({...formData, usageCount: Number(e.target.value)})}
                className="w-full"
                placeholder="Unesite broj veziva"
              />
            </div>
          </div>
          
          <div className="col-12 flex justify-content-end gap-2">
            <Button 
              label={editingConsumption ? 'Ažuriraj' : 'Kreiraj'}
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

export default Consumption;
