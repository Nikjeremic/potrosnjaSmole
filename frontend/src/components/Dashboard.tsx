import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Consumption, Inventory, Resin } from '../types';
import { consumptionAPI, inventoryAPI, resinsAPI } from '../services/api';
import { formatDate, getTodayDateString, SHIFTS } from '../utils/shiftUtils';
import dayjs from 'dayjs';

const Dashboard: React.FC = () => {
  const [consumptions, setConsumptions] = useState<Consumption[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [resins, setResins] = useState<Resin[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const dateString = selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : undefined;
      const [consumptionData, inventoryData, resinsData] = await Promise.all([
        consumptionAPI.getAll(dateString),
        inventoryAPI.getAll(),
        resinsAPI.getAll()
      ]);
      
      setConsumptions(consumptionData);
      setInventory(inventoryData);
      setResins(resinsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter inventory to only include materials (items with materialId)
  const getMaterialsInventory = () => {
    return inventory.filter(item => item.materialId);
  };

  const getTotalAvailableWeight = () => {
    const materialsInventory = getMaterialsInventory();
    return materialsInventory.reduce((total, item) => total + item.availableWeight, 0);
  };

  const getTotalConsumedWeight = () => {
    const materialsInventory = getMaterialsInventory();
    return materialsInventory.reduce((total, item) => total + item.consumedWeight, 0);
  };

  const getTodayConsumption = () => {
    return consumptions.reduce((total, item) => total + item.totalConsumption, 0);
  };

  const shiftBodyTemplate = (rowData: Consumption) => {
    const shiftInfo = SHIFTS.find(s => s.shift === rowData.shift);
    return shiftInfo?.label || rowData.shift;
  };

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
        <h2>Dashboard</h2>
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
            <div className="custom-statistic-value text-red-500">
              {getTotalConsumedWeight().toFixed(2)}
            </div>
            <div className="custom-statistic-label">Ukupno potrošeno (kg)</div>
          </Card>
        </div>
        <div className="col-12 md:col-3">
          <Card className="custom-statistic-card">
            <div className="custom-statistic-value text-blue-500">
              {getTodayConsumption().toFixed(2)}
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
      </div>

      <Card title={getTitle()}>
        <DataTable
          value={consumptions}
          paginator
          rows={10}
          emptyMessage={selectedDate ? "Nema podataka za odabrani datum" : "Nema podataka"}
          className="p-datatable-sm"
        >
          <Column field="date" header="Datum" body={(rowData: Consumption) => formatDate(rowData.date)} />
          <Column field="shift" header="Smena" body={shiftBodyTemplate} />
          <Column field="employeeName" header="Zaposleni" />
          <Column field="resinName" header="Sarza" />
          <Column field="materialName" header="Materijal" />
          <Column field="usageCount" header="Vezivo" />
          <Column 
            field="totalConsumption" 
            header="Ukupna potrošnja (kg)" 
            body={(rowData: Consumption) => `${rowData.totalConsumption.toFixed(2)} kg`}
          />
        </DataTable>
      </Card>
    </div>
  );
};

export default Dashboard;
