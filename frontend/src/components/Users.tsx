import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Password } from 'primereact/password';
import { Message } from 'primereact/message';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { User } from '../types';
import { usersAPI } from '../services/api';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'user' as 'admin' | 'user',
    password: ''
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersData = await usersAPI.getAll();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      role: 'user',
      password: ''
    });
    setError('');
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      password: ''
    });
    setError('');
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await usersAPI.delete(id);
      fetchData();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      setError(error.response?.data?.message || "Greška pri brisanju korisnika");
    }
  };

  const handleResetPassword = (user: User) => {
    setEditingUser(user);
    setPasswordData({ newPassword: '', confirmPassword: '' });
    setError('');
    setPasswordModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      setError('');
      
      if (editingUser) {
        await usersAPI.update(editingUser._id, formData);
      } else {
        await usersAPI.create(formData);
      }

      setModalVisible(false);
      fetchData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Greška pri čuvanju korisnika');
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      setError('');
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('Lozinke se ne poklapaju!');
        return;
      }

      await usersAPI.resetPassword(editingUser!._id, passwordData.newPassword);
      setPasswordModalVisible(false);
      fetchData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Greška pri resetovanju lozinke');
    }
  };

  const getAdminCount = () => {
    return users.filter(user => user.role === 'admin').length;
  };

  const getUserCount = () => {
    return users.filter(user => user.role === 'user').length;
  };

  const roleBodyTemplate = (rowData: User) => {
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
        rowData.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
      }`}>
        {rowData.role === 'admin' ? 'Admin' : 'Korisnik'}
      </span>
    );
  };

  const actionsBodyTemplate = (rowData: User) => {
    return (
      <div className="flex gap-2">
        <Button 
          icon="pi pi-pencil" 
          className="p-button-text p-button-sm"
          onClick={() => handleEdit(rowData)}
        />
        <Button 
          icon="pi pi-key" 
          className="p-button-text p-button-sm"
          onClick={() => handleResetPassword(rowData)}
        />
        <Button 
          icon="pi pi-trash" 
          className="p-button-text p-button-sm p-button-danger"
          onClick={() => {
            confirmDialog({
              message: 'Da li ste sigurni da želite da obrišete ovog korisnika?',
              header: 'Potvrda brisanja',
              icon: 'pi pi-exclamation-triangle',
              accept: () => handleDelete(rowData._id)
            });
          }}
        />
      </div>
    );
  };

  const roleOptions = [
    "user",
    "admin"
  ];
  const getRoleLabel = (role: string) => {
    return role === "admin" ? "Administrator" : "Korisnik";
  };

  return (
    <div className="p-4">
      <div className="flex justify-content-between align-items-center mb-4">
        <h2>Upravljanje korisnicima</h2>
        <div className="flex gap-2">
          <Button 
            icon="pi pi-refresh" 
            onClick={fetchData} 

            className="p-button-outlined"
          />
          <Button 
            label="Dodaj korisnika" 
            icon="pi pi-plus" 
            onClick={handleAdd}
            severity="info"
          />
        </div>
      </div>

      <div className="grid mb-4">
        <div className="col-12 md:col-4">
          <Card className="custom-statistic-card">
            <div className="custom-statistic-value text-blue-500">
              {users.length}
            </div>
            <div className="custom-statistic-label">Ukupno korisnika</div>
          </Card>
        </div>
        <div className="col-12 md:col-4">
          <Card className="custom-statistic-card">
            <div className="custom-statistic-value text-red-500">
              {getAdminCount()}
            </div>
            <div className="custom-statistic-label">Administratori</div>
          </Card>
        </div>
        <div className="col-12 md:col-4">
          <Card className="custom-statistic-card">
            <div className="custom-statistic-value text-green-500">
              {getUserCount()}
            </div>
            <div className="custom-statistic-label">Obični korisnici</div>
          </Card>
        </div>
      </div>

      <Card title="Lista korisnika">
        <DataTable
          value={users}

          paginator
          rows={10}
          emptyMessage="Nema korisnika"
          className="p-datatable-sm"
        >
          <Column field="username" header="Korisničko ime" />
          <Column field="email" header="Email" />
          <Column field="firstName" header="Ime" />
          <Column field="lastName" header="Prezime" />
          <Column field="role" header="Uloga" body={roleBodyTemplate} />
          <Column header="Akcije" body={actionsBodyTemplate} />
        </DataTable>
      </Card>

      <Dialog
        header={editingUser ? 'Izmeni korisnika' : 'Dodaj novog korisnika'}
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
              <label htmlFor="username" className="block mb-2">Korisničko ime</label>
              <InputText
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full"
                placeholder="Unesite korisničko ime"
              />
            </div>
          </div>
          
          <div className="col-12">
            <div className="field">
              <label htmlFor="email" className="block mb-2">Email</label>
              <InputText
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full"
                placeholder="Unesite email"
              />
            </div>
          </div>
          
          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="firstName" className="block mb-2">Ime</label>
              <InputText
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full"
                placeholder="Unesite ime"
              />
            </div>
          </div>
          
          <div className="col-12 md:col-6">
            <div className="field">
              <label htmlFor="lastName" className="block mb-2">Prezime</label>
              <InputText
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full"
                placeholder="Unesite prezime"
              />
            </div>
          </div>
          
          <div className="col-12">
            <div className="field">
              <label htmlFor="role" className="block mb-2">Uloga</label>
              <Dropdown
                id="role"
                value={formData.role}
                itemTemplate={(option) => getRoleLabel(option)}
                options={roleOptions}
                onChange={(e) => setFormData({...formData, role: e.value})}
                className="w-full"
                placeholder="Odaberite ulogu"
                appendTo="self"
              />
            </div>
          </div>
          
          {!editingUser && (
            <div className="col-12">
              <div className="field">
                <label htmlFor="password" className="block mb-2">Lozinka</label>
                <Password
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full"
                  placeholder="Unesite lozinku"
                  feedback={false}
                  toggleMask
                />
              </div>
            </div>
          )}
          
          <div className="col-12 flex justify-content-end gap-2">
            <Button 
              label={editingUser ? 'Ažuriraj' : 'Kreiraj'}
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

      <Dialog
        header="Resetuj lozinku"
        visible={passwordModalVisible}
        onHide={() => setPasswordModalVisible(false)}
        style={{ width: '500px' }}
        className="p-fluid"
      >
        {error && (
          <Message severity="error" text={error} className="mb-3" />
        )}
        
        <div className="grid">
          <div className="col-12">
            <div className="field">
              <label htmlFor="newPassword" className="block mb-2">Nova lozinka</label>
              <Password
                id="newPassword"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                className="w-full"
                placeholder="Unesite novu lozinku"
                feedback={false}
                toggleMask
              />
            </div>
          </div>
          
          <div className="col-12">
            <div className="field">
              <label htmlFor="confirmPassword" className="block mb-2">Potvrdi lozinku</label>
              <Password
                id="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                className="w-full"
                placeholder="Potvrdite novu lozinku"
                feedback={false}
                toggleMask
              />
            </div>
          </div>
          
          <div className="col-12 flex justify-content-end gap-2">
            <Button 
              label="Resetuj lozinku"
              onClick={handlePasswordSubmit}
              severity="info"
            />
            <Button 
              label="Otkaži"
              onClick={() => setPasswordModalVisible(false)}
              className="p-button-outlined"
            />
          </div>
        </div>
      </Dialog>

      <ConfirmDialog />
    </div>
  );
};

export default Users;
