import * as React from 'react';

export interface AddUserModalFormData {
  name: string;
  dob: string;
  email: string;
  username: string;
  role: 'Author' | 'Reviewer' | 'Approver' | 'Admin';
  mobile: string;
  photo: string;
}

export interface AddUserModalDataParams {
  onClose: () => void;
  onSuccess: (userData: any) => void;
}

export function AddUserModalData(params: AddUserModalDataParams) {
  const { onClose, onSuccess } = params;

  const [formData, setFormData] = React.useState<AddUserModalFormData>({
    name: '',
    dob: '',
    email: '',
    username: '',
    role: 'Author',
    mobile: '',
    photo: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      dob: '',
      email: '',
      username: '',
      role: 'Author',
      mobile: '',
      photo: ''
    });
  };

  const closeAndReset = () => {
    onClose();
    resetForm();
  };

  const handleSubmit = () => {
    onSuccess({
      id: Date.now(),
      ...formData,
      status: 'Active'
    });
    closeAndReset();
  };

  const canSubmit =
    Boolean(formData.name.trim()) &&
    Boolean(formData.dob) &&
    Boolean(formData.email.trim()) &&
    Boolean(formData.username.trim()) &&
    Boolean(formData.mobile.trim()) &&
    Boolean(formData.role);

  return {
    formData,
    setFormData,
    canSubmit,
    handleSubmit,
    closeAndReset
  };
}

